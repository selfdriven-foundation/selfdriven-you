var entityos = require('entityos');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

module.exports =
{
    VERSION: '1.1.0',

    init: function (param)
    {
        // ── Config (credentials) ────────────────────────────────
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-get-config',
            code: function ()
            {
                const settings = entityos.get({ scope: '_settings' });

                let accessID = _.get(settings, 'infrastructure.aws.access.id');
                let accessSecretKey = _.get(settings, 'infrastructure.aws.access.secret');

                if (accessID == 'prompt' || accessSecretKey == 'prompt')
                {
                    const prompt = require('prompt-sync')();
                    if (accessID == 'prompt')
                    {
                        accessID = prompt('AWS Access ID: ');
                        _.set(settings, 'infrastructure.aws.access.id', accessID);
                    }
                    if (accessSecretKey == 'prompt')
                    {
                        accessSecretKey = prompt('AWS Access Secret Key: ');
                        _.set(settings, 'infrastructure.aws.access.secret', accessSecretKey);
                    }
                }

                process.env.AWS_ACCESS_KEY_ID = _.get(settings, 'infrastructure.aws.access.id');
                process.env.AWS_SECRET_ACCESS_KEY = _.get(settings, 'infrastructure.aws.access.secret');

                return {
                    credentials: {
                        accessKeyId:     _.get(settings, 'infrastructure.aws.access.id'),
                        secretAccessKey: _.get(settings, 'infrastructure.aws.access.secret')
                    },
                    region: _.get(settings, 'deploy.region', 'ap-southeast-2')
                };
            }
        });

        // ── Deploy settings getter ──────────────────────────────
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-get-deploy-settings',
            code: function ()
            {
                const settings = entityos.get({ scope: '_settings' });

                return {
                    region:             _.get(settings, 'deploy.region', 'ap-southeast-2'),
                    deployBucket:       _.get(settings, 'deploy.deployBucket', 'ambassador-apply-deploy'),
                    applicationsBucket: _.get(settings, 'deploy.applicationsBucket', 'selfdriven-ambassador-applications'),
                    applicationsPrefix: _.get(settings, 'deploy.applicationsPrefix', 'applications/'),
                    allowedOrigin:      _.get(settings, 'deploy.allowedOrigin', '*'),
                    lambdaFolder:       _.get(settings, 'deploy.lambdaFolder', '../lambda'),
                    lambdaZipName:      _.get(settings, 'deploy.lambdaZipName', 'ambassador-apply-lambda.zip'),
                    functionName:       _.get(settings, 'deploy.functionName', 'ambassador-apply'),
                    roleName:           _.get(settings, 'deploy.roleName', 'ambassador-apply-lambda-role'),
                    handler:            _.get(settings, 'deploy.handler', 'index.handler'),
                    runtime:            _.get(settings, 'deploy.runtime', 'nodejs20.x'),
                    timeout:            _.get(settings, 'deploy.timeout', 15),
                    memory:             _.get(settings, 'deploy.memory', 256),
                    topicName:          _.get(settings, 'deploy.topicName', 'ambassador-apply-alerts'),
                    notifyEmail:        _.get(settings, 'deploy.notifyEmail', ''),
                    apiName:            _.get(settings, 'deploy.apiName', 'ambassador-apply-api'),
                    apiStage:           _.get(settings, 'deploy.apiStage', 'live'),
                    webAclName:         _.get(settings, 'deploy.webAclName', 'ambassador-apply-waf'),
                    wafRateLimit:       _.get(settings, 'deploy.wafRateLimit', 300)
                };
            }
        });

        // ── Entry point ─────────────────────────────────────────
        entityos.add(
        {
            name: 'app-process-aws-ambassador-apply-deploy',
            code: function ()
            {
                const deploy = entityos.invoke('util-aws-ambassador-apply-get-deploy-settings');

                console.log('\n── ambassador-apply deploy ─────────────');
                console.log('Region:      ', deploy.region);
                console.log('Function:    ', deploy.functionName);
                console.log('Applications:', deploy.applicationsBucket + '/' + deploy.applicationsPrefix);
                console.log('Alerts topic:', deploy.topicName);
                console.log('API:         ', deploy.apiName + ' (stage: ' + deploy.apiStage + ')');
                console.log('WAF:         ', deploy.webAclName + ' (rate ' + deploy.wafRateLimit + '/5min/IP)');
                console.log('────────────────────────────────────────\n');

                entityos.invoke('util-aws-ambassador-apply-deploy-s3-bucket-check');
            }
        });

        // ── [1] Deploy bucket check ─────────────────────────────
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-deploy-s3-bucket-check',
            code: function ()
            {
                const deploy = entityos.invoke('util-aws-ambassador-apply-get-deploy-settings');
                const { S3Client, HeadBucketCommand } = require('@aws-sdk/client-s3');
                const s3 = new S3Client(entityos.invoke('util-aws-ambassador-apply-get-config'));

                console.log('[1/14] Checking deploy bucket:', deploy.deployBucket);

                s3.send(new HeadBucketCommand({ Bucket: deploy.deployBucket }))
                .then(function ()
                {
                    console.log('  ✓ Deploy bucket exists — skipping create');
                    entityos.invoke('util-aws-ambassador-apply-deploy-applications-bucket-check');
                })
                .catch(function (err)
                {
                    if (err.$metadata?.httpStatusCode === 404 || err.name === 'NotFound' || err.name === 'NoSuchBucket')
                    {
                        entityos.invoke('util-aws-ambassador-apply-deploy-s3-bucket-create');
                    }
                    else
                    {
                        entityos.invoke('util-end', 'HeadBucket(deploy) error: ' + err.message, '500');
                    }
                });
            }
        });

        // ── [2] Deploy bucket create ────────────────────────────
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-deploy-s3-bucket-create',
            code: function ()
            {
                const deploy = entityos.invoke('util-aws-ambassador-apply-get-deploy-settings');
                const { S3Client, CreateBucketCommand } = require('@aws-sdk/client-s3');
                const s3 = new S3Client(entityos.invoke('util-aws-ambassador-apply-get-config'));

                console.log('[2/14] Creating deploy bucket:', deploy.deployBucket);

                let commandParams = { Bucket: deploy.deployBucket };
                if (deploy.region !== 'us-east-1')
                {
                    commandParams.CreateBucketConfiguration = { LocationConstraint: deploy.region };
                }

                s3.send(new CreateBucketCommand(commandParams))
                .then(function (response)
                {
                    console.log('  ✓ Deploy bucket created:', response.Location);
                    entityos.invoke('util-aws-ambassador-apply-deploy-applications-bucket-check');
                })
                .catch(function (err)
                {
                    entityos.invoke('util-end', 'CreateBucket(deploy) error: ' + err.message, '500');
                });
            }
        });

        // ── [3] Applications bucket check ───────────────────────
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-deploy-applications-bucket-check',
            code: function ()
            {
                const deploy = entityos.invoke('util-aws-ambassador-apply-get-deploy-settings');
                const { S3Client, HeadBucketCommand } = require('@aws-sdk/client-s3');
                const s3 = new S3Client(entityos.invoke('util-aws-ambassador-apply-get-config'));

                console.log('[3/14] Checking applications bucket:', deploy.applicationsBucket);

                s3.send(new HeadBucketCommand({ Bucket: deploy.applicationsBucket }))
                .then(function ()
                {
                    console.log('  ✓ Applications bucket exists — skipping create');
                    entityos.invoke('util-aws-ambassador-apply-deploy-sns-topic');
                })
                .catch(function (err)
                {
                    if (err.$metadata?.httpStatusCode === 404 || err.name === 'NotFound' || err.name === 'NoSuchBucket')
                    {
                        entityos.invoke('util-aws-ambassador-apply-deploy-applications-bucket-create');
                    }
                    else
                    {
                        entityos.invoke('util-end', 'HeadBucket(applications) error: ' + err.message, '500');
                    }
                });
            }
        });

        // ── [4] Applications bucket create + lock down ──────────
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-deploy-applications-bucket-create',
            code: function ()
            {
                const deploy = entityos.invoke('util-aws-ambassador-apply-get-deploy-settings');
                const {
                    S3Client, CreateBucketCommand,
                    PutPublicAccessBlockCommand, PutBucketEncryptionCommand, PutBucketVersioningCommand
                } = require('@aws-sdk/client-s3');
                const s3 = new S3Client(entityos.invoke('util-aws-ambassador-apply-get-config'));

                console.log('[4/14] Creating applications bucket:', deploy.applicationsBucket);

                let commandParams = { Bucket: deploy.applicationsBucket };
                if (deploy.region !== 'us-east-1')
                {
                    commandParams.CreateBucketConfiguration = { LocationConstraint: deploy.region };
                }

                s3.send(new CreateBucketCommand(commandParams))
                .then(function ()
                {
                    return Promise.all([
                        s3.send(new PutPublicAccessBlockCommand({
                            Bucket: deploy.applicationsBucket,
                            PublicAccessBlockConfiguration: {
                                BlockPublicAcls: true, BlockPublicPolicy: true,
                                IgnorePublicAcls: true, RestrictPublicBuckets: true
                            }
                        })),
                        s3.send(new PutBucketEncryptionCommand({
                            Bucket: deploy.applicationsBucket,
                            ServerSideEncryptionConfiguration: {
                                Rules: [{ ApplyServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' } }]
                            }
                        })),
                        s3.send(new PutBucketVersioningCommand({
                            Bucket: deploy.applicationsBucket,
                            VersioningConfiguration: { Status: 'Enabled' }
                        }))
                    ]);
                })
                .then(function ()
                {
                    console.log('  ✓ Applications bucket: public access blocked, AES-256, versioning enabled');
                    entityos.invoke('util-aws-ambassador-apply-deploy-sns-topic');
                })
                .catch(function (err)
                {
                    entityos.invoke('util-end', 'Applications bucket create error: ' + err.message, '500');
                });
            }
        });

        // ── [5] SNS topic ensure (idempotent) + optional email sub ──
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-deploy-sns-topic',
            code: function ()
            {
                const deploy = entityos.invoke('util-aws-ambassador-apply-get-deploy-settings');
                const {
                    SNSClient, CreateTopicCommand,
                    ListSubscriptionsByTopicCommand, SubscribeCommand
                } = require('@aws-sdk/client-sns');
                const sns = new SNSClient(entityos.invoke('util-aws-ambassador-apply-get-config'));

                console.log('[5/14] Ensuring SNS topic:', deploy.topicName);

                // CreateTopic is idempotent — returns existing ARN if the name already exists.
                sns.send(new CreateTopicCommand({ Name: deploy.topicName }))
                .then(function (response)
                {
                    const topicArn = response.TopicArn;
                    entityos.set({ scope: 'ambassador-apply-deploy', context: 'snsTopicArn', value: topicArn });
                    console.log('  ✓ Topic ready:', topicArn);

                    if (deploy.notifyEmail === '')
                    {
                        entityos.invoke('util-aws-ambassador-apply-deploy-zip');
                        return;
                    }

                    // Subscribe the notify email if not already subscribed.
                    sns.send(new ListSubscriptionsByTopicCommand({ TopicArn: topicArn }))
                    .then(function (subs)
                    {
                        const existing = _.find(subs.Subscriptions, function (s)
                        {
                            return s.Protocol === 'email' && s.Endpoint === deploy.notifyEmail;
                        });

                        if (existing)
                        {
                            console.log('  ✓ Email already subscribed:', deploy.notifyEmail);
                            entityos.invoke('util-aws-ambassador-apply-deploy-zip');
                            return;
                        }

                        sns.send(new SubscribeCommand({
                            TopicArn: topicArn,
                            Protocol: 'email',
                            Endpoint: deploy.notifyEmail
                        }))
                        .then(function ()
                        {
                            console.log('  → Subscription created for ' + deploy.notifyEmail + ' — they must click the confirmation email');
                            entityos.invoke('util-aws-ambassador-apply-deploy-zip');
                        })
                        .catch(function (err)
                        {
                            entityos.invoke('util-end', 'SNS Subscribe error: ' + err.message, '500');
                        });
                    })
                    .catch(function (err)
                    {
                        entityos.invoke('util-end', 'SNS ListSubscriptions error: ' + err.message, '500');
                    });
                })
                .catch(function (err)
                {
                    entityos.invoke('util-end', 'SNS CreateTopic error: ' + err.message, '500');
                });
            }
        });

        // ── [6] Zip lambda folder ───────────────────────────────
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-deploy-zip',
            code: function ()
            {
                const deploy = entityos.invoke('util-aws-ambassador-apply-get-deploy-settings');
                const lambdaFolder = path.resolve(__dirname, deploy.lambdaFolder);
                const zipPath = path.join(lambdaFolder, '..', deploy.lambdaZipName);

                console.log('[6/14] Zipping lambda folder:', lambdaFolder, '→', zipPath);

                const archiver = require('archiver');
                const output   = fs.createWriteStream(zipPath);
                const archive  = archiver('zip', { zlib: { level: 9 } });

                output.on('close', function ()
                {
                    console.log('  ✓ Zip created:', archive.pointer(), 'bytes');
                    entityos.set({ scope: 'ambassador-apply-deploy', context: 'zipPath', value: zipPath });
                    entityos.invoke('util-aws-ambassador-apply-deploy-s3-upload');
                });

                archive.on('error', function (err)
                {
                    entityos.invoke('util-end', 'Zip error: ' + err.message, '500');
                });

                archive.pipe(output);
                archive.glob('**/*', {
                    cwd: lambdaFolder,
                    ignore: ['node_modules/lambda-local/**', 'events/**', '*.zip']
                });
                archive.finalize();
            }
        });

        // ── [7] Upload zip to deploy bucket ─────────────────────
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-deploy-s3-upload',
            code: function ()
            {
                const deploy  = entityos.invoke('util-aws-ambassador-apply-get-deploy-settings');
                const zipPath = entityos.get({ scope: 'ambassador-apply-deploy', context: 'zipPath' });
                const zipData = fs.readFileSync(zipPath);
                const s3Key   = 'releases/' + deploy.lambdaZipName;

                const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
                const s3 = new S3Client(entityos.invoke('util-aws-ambassador-apply-get-config'));

                console.log('[7/14] Uploading zip to s3://' + deploy.deployBucket + '/' + s3Key);

                s3.send(new PutObjectCommand({
                    Bucket: deploy.deployBucket, Key: s3Key,
                    Body: zipData, ContentType: 'application/zip',
                    ServerSideEncryption: 'AES256'
                }))
                .then(function (response)
                {
                    console.log('  ✓ Zip uploaded, ETag:', response.ETag);
                    entityos.set({ scope: 'ambassador-apply-deploy', context: 's3Key', value: s3Key });
                    entityos.invoke('util-aws-ambassador-apply-deploy-iam-role-check');
                })
                .catch(function (err)
                {
                    entityos.invoke('util-end', 'S3 upload error: ' + err.message, '500');
                });
            }
        });

        // ── [8] IAM role check ──────────────────────────────────
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-deploy-iam-role-check',
            code: function ()
            {
                const deploy = entityos.invoke('util-aws-ambassador-apply-get-deploy-settings');
                const { IAMClient, GetRoleCommand } = require('@aws-sdk/client-iam');
                const iam = new IAMClient(entityos.invoke('util-aws-ambassador-apply-get-config'));

                console.log('[8/14] Checking IAM role:', deploy.roleName);

                iam.send(new GetRoleCommand({ RoleName: deploy.roleName }))
                .then(function (response)
                {
                    console.log('  ✓ Role exists:', response.Role.Arn);
                    entityos.set({ scope: 'ambassador-apply-deploy', context: 'roleARN', value: response.Role.Arn });
                    // Ensure the inline policy reflects current bucket/topic on re-runs.
                    entityos.invoke('util-aws-ambassador-apply-deploy-iam-role-policy');
                })
                .catch(function (err)
                {
                    if (err.name === 'NoSuchEntityException')
                    {
                        entityos.invoke('util-aws-ambassador-apply-deploy-iam-role-create');
                    }
                    else
                    {
                        entityos.invoke('util-end', 'GetRole error: ' + err.message, '500');
                    }
                });
            }
        });

        // ── [9] IAM role create ─────────────────────────────────
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-deploy-iam-role-create',
            code: function ()
            {
                const deploy = entityos.invoke('util-aws-ambassador-apply-get-deploy-settings');
                const { IAMClient, CreateRoleCommand, AttachRolePolicyCommand } = require('@aws-sdk/client-iam');
                const iam = new IAMClient(entityos.invoke('util-aws-ambassador-apply-get-config'));

                console.log('[9/14] Creating IAM role:', deploy.roleName);

                const assumeRolePolicy = {
                    Version: '2012-10-17',
                    Statement: [{ Effect: 'Allow', Principal: { Service: 'lambda.amazonaws.com' }, Action: 'sts:AssumeRole' }]
                };

                iam.send(new CreateRoleCommand({
                    RoleName: deploy.roleName,
                    AssumeRolePolicyDocument: JSON.stringify(assumeRolePolicy),
                    Description: deploy.functionName + ' Lambda execution role'
                }))
                .then(function (response)
                {
                    entityos.set({ scope: 'ambassador-apply-deploy', context: 'roleARN', value: response.Role.Arn });
                    return iam.send(new AttachRolePolicyCommand({
                        RoleName: deploy.roleName,
                        PolicyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'
                    }));
                })
                .then(function ()
                {
                    console.log('  ✓ Role created, basic execution attached');
                    entityos.invoke('util-aws-ambassador-apply-deploy-iam-role-policy');
                })
                .catch(function (err)
                {
                    entityos.invoke('util-end', 'IAM role create error: ' + err.message, '500');
                });
            }
        });

        // ── [9b] IAM inline policy: scoped S3 PutObject + SNS Publish ──
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-deploy-iam-role-policy',
            code: function ()
            {
                const deploy   = entityos.invoke('util-aws-ambassador-apply-get-deploy-settings');
                const topicArn = entityos.get({ scope: 'ambassador-apply-deploy', context: 'snsTopicArn' });
                const { IAMClient, PutRolePolicyCommand } = require('@aws-sdk/client-iam');
                const iam = new IAMClient(entityos.invoke('util-aws-ambassador-apply-get-config'));

                const policy = {
                    Version: '2012-10-17',
                    Statement: [
                        {
                            Sid: 'WriteApplications',
                            Effect: 'Allow',
                            Action: 's3:PutObject',
                            Resource: 'arn:aws:s3:::' + deploy.applicationsBucket + '/' + deploy.applicationsPrefix + '*'
                        },
                        {
                            Sid: 'PublishAlerts',
                            Effect: 'Allow',
                            Action: 'sns:Publish',
                            Resource: topicArn
                        }
                    ]
                };

                console.log('  → Putting inline policy: s3:PutObject + sns:Publish');

                iam.send(new PutRolePolicyCommand({
                    RoleName: deploy.roleName,
                    PolicyName: 'ambassador-apply-write-and-notify',
                    PolicyDocument: JSON.stringify(policy)
                }))
                .then(function ()
                {
                    console.log('  ✓ Inline policy applied — waiting 10s for IAM propagation');
                    setTimeout(function () { entityos.invoke('util-aws-ambassador-apply-deploy-lambda-check'); }, 10000);
                })
                .catch(function (err)
                {
                    entityos.invoke('util-end', 'PutRolePolicy error: ' + err.message, '500');
                });
            }
        });

        // ── [10] Lambda check ───────────────────────────────────
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-deploy-lambda-check',
            code: function ()
            {
                const deploy = entityos.invoke('util-aws-ambassador-apply-get-deploy-settings');
                const { LambdaClient, GetFunctionCommand } = require('@aws-sdk/client-lambda');
                const lambda = new LambdaClient(entityos.invoke('util-aws-ambassador-apply-get-config'));

                console.log('[10/14] Checking Lambda function:', deploy.functionName);

                lambda.send(new GetFunctionCommand({ FunctionName: deploy.functionName }))
                .then(function (response)
                {
                    console.log('  ✓ Function exists:', response.Configuration.FunctionArn);
                    entityos.set({ scope: 'ambassador-apply-deploy', context: 'functionARN', value: response.Configuration.FunctionArn });
                    entityos.invoke('util-aws-ambassador-apply-deploy-lambda-update');
                })
                .catch(function (err)
                {
                    if (err.name === 'ResourceNotFoundException')
                    {
                        entityos.invoke('util-aws-ambassador-apply-deploy-lambda-create');
                    }
                    else
                    {
                        entityos.invoke('util-end', 'GetFunction error: ' + err.message, '500');
                    }
                });
            }
        });

        // ── [11a] Lambda create ─────────────────────────────────
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-deploy-lambda-create',
            code: function ()
            {
                const deploy   = entityos.invoke('util-aws-ambassador-apply-get-deploy-settings');
                const roleARN  = entityos.get({ scope: 'ambassador-apply-deploy', context: 'roleARN' });
                const s3Key    = entityos.get({ scope: 'ambassador-apply-deploy', context: 's3Key' });
                const topicArn = entityos.get({ scope: 'ambassador-apply-deploy', context: 'snsTopicArn' });

                const { LambdaClient, CreateFunctionCommand } = require('@aws-sdk/client-lambda');
                const lambda = new LambdaClient(entityos.invoke('util-aws-ambassador-apply-get-config'));

                console.log('[11/14] Creating Lambda function:', deploy.functionName);

                lambda.send(new CreateFunctionCommand({
                    FunctionName: deploy.functionName,
                    Runtime:      deploy.runtime,
                    Role:         roleARN,
                    Handler:      deploy.handler,
                    Code:         { S3Bucket: deploy.deployBucket, S3Key: s3Key },
                    Timeout:      deploy.timeout,
                    MemorySize:   deploy.memory,
                    Environment: {
                        Variables: {
                            APPLICATIONS_BUCKET: deploy.applicationsBucket,
                            APPLICATIONS_PREFIX: deploy.applicationsPrefix,
                            ALLOWED_ORIGIN:      deploy.allowedOrigin,
                            SNS_TOPIC_ARN:       topicArn
                        }
                    }
                }))
                .then(function (response)
                {
                    console.log('  ✓ Function created:', response.FunctionArn);
                    entityos.set({ scope: 'ambassador-apply-deploy', context: 'functionARN', value: response.FunctionArn });
                    entityos.invoke('util-aws-ambassador-apply-deploy-apigw-check');
                })
                .catch(function (err)
                {
                    entityos.invoke('util-end', 'CreateFunction error: ' + err.message, '500');
                });
            }
        });

        // ── [11b] Lambda update (code + config/env) ─────────────
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-deploy-lambda-update',
            code: function ()
            {
                const deploy   = entityos.invoke('util-aws-ambassador-apply-get-deploy-settings');
                const roleARN  = entityos.get({ scope: 'ambassador-apply-deploy', context: 'roleARN' });
                const s3Key    = entityos.get({ scope: 'ambassador-apply-deploy', context: 's3Key' });
                const topicArn = entityos.get({ scope: 'ambassador-apply-deploy', context: 'snsTopicArn' });

                const { LambdaClient, UpdateFunctionCodeCommand, UpdateFunctionConfigurationCommand } = require('@aws-sdk/client-lambda');
                const lambda = new LambdaClient(entityos.invoke('util-aws-ambassador-apply-get-config'));

                console.log('[11/14] Updating Lambda code + configuration:', deploy.functionName);

                lambda.send(new UpdateFunctionCodeCommand({
                    FunctionName: deploy.functionName,
                    S3Bucket:     deploy.deployBucket,
                    S3Key:        s3Key
                }))
                .then(function ()
                {
                    return new Promise(function (res) { setTimeout(res, 4000); });
                })
                .then(function ()
                {
                    return lambda.send(new UpdateFunctionConfigurationCommand({
                        FunctionName: deploy.functionName,
                        Runtime:      deploy.runtime,
                        Role:         roleARN,
                        Handler:      deploy.handler,
                        Timeout:      deploy.timeout,
                        MemorySize:   deploy.memory,
                        Environment: {
                            Variables: {
                                APPLICATIONS_BUCKET: deploy.applicationsBucket,
                                APPLICATIONS_PREFIX: deploy.applicationsPrefix,
                                ALLOWED_ORIGIN:      deploy.allowedOrigin,
                                SNS_TOPIC_ARN:       topicArn
                            }
                        }
                    }));
                })
                .then(function ()
                {
                    console.log('  ✓ Function code + configuration updated');
                    entityos.invoke('util-aws-ambassador-apply-deploy-apigw-check');
                })
                .catch(function (err)
                {
                    entityos.invoke('util-end', 'UpdateFunction error: ' + err.message, '500');
                });
            }
        });

        // ── [12] API Gateway REST API check / create ────────────
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-deploy-apigw-check',
            code: function ()
            {
                const deploy = entityos.invoke('util-aws-ambassador-apply-get-deploy-settings');
                const { APIGatewayClient, GetRestApisCommand } = require('@aws-sdk/client-api-gateway');
                const apigw = new APIGatewayClient(entityos.invoke('util-aws-ambassador-apply-get-config'));

                console.log('[12/14] Checking API Gateway REST API:', deploy.apiName);

                apigw.send(new GetRestApisCommand({ limit: 500 }))
                .then(function (response)
                {
                    const existing = _.find(response.items, function (api) { return api.name === deploy.apiName; });

                    if (existing)
                    {
                        console.log('  ✓ REST API exists:', existing.id);
                        entityos.set({ scope: 'ambassador-apply-deploy', context: 'apiId', value: existing.id });
                        entityos.invoke('util-aws-ambassador-apply-deploy-apigw-configure');
                    }
                    else
                    {
                        entityos.invoke('util-aws-ambassador-apply-deploy-apigw-create');
                    }
                })
                .catch(function (err)
                {
                    entityos.invoke('util-end', 'GetRestApis error: ' + err.message, '500');
                });
            }
        });

        // ── [12b] API Gateway REST API create ───────────────────
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-deploy-apigw-create',
            code: function ()
            {
                const deploy = entityos.invoke('util-aws-ambassador-apply-get-deploy-settings');
                const { APIGatewayClient, CreateRestApiCommand } = require('@aws-sdk/client-api-gateway');
                const apigw = new APIGatewayClient(entityos.invoke('util-aws-ambassador-apply-get-config'));

                console.log('  → Creating REST API:', deploy.apiName);

                apigw.send(new CreateRestApiCommand({
                    name: deploy.apiName,
                    description: 'selfdriven.you ambassador application intake',
                    endpointConfiguration: { types: ['REGIONAL'] }
                }))
                .then(function (response)
                {
                    console.log('  ✓ REST API created:', response.id);
                    entityos.set({ scope: 'ambassador-apply-deploy', context: 'apiId', value: response.id });
                    entityos.invoke('util-aws-ambassador-apply-deploy-apigw-configure');
                })
                .catch(function (err)
                {
                    entityos.invoke('util-end', 'CreateRestApi error: ' + err.message, '500');
                });
            }
        });

        // ── [13] API GW: method + proxy integration + permission + deploy stage ──
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-deploy-apigw-configure',
            code: function ()
            {
                const deploy      = entityos.invoke('util-aws-ambassador-apply-get-deploy-settings');
                const apiId       = entityos.get({ scope: 'ambassador-apply-deploy', context: 'apiId' });
                const functionARN = entityos.get({ scope: 'ambassador-apply-deploy', context: 'functionARN' });
                const accountId   = functionARN.split(':')[4];

                const {
                    APIGatewayClient, GetResourcesCommand, PutMethodCommand,
                    PutIntegrationCommand, CreateDeploymentCommand
                } = require('@aws-sdk/client-api-gateway');
                const { LambdaClient, AddPermissionCommand } = require('@aws-sdk/client-lambda');

                const cfg = entityos.invoke('util-aws-ambassador-apply-get-config');
                const apigw = new APIGatewayClient(cfg);
                const lambda = new LambdaClient(cfg);

                console.log('[13/14] Configuring API: ANY / → Lambda proxy, then deploying stage:', deploy.apiStage);

                const integrationUri = 'arn:aws:apigateway:' + deploy.region
                    + ':lambda:path/2015-03-31/functions/' + functionARN + '/invocations';

                let rootId;

                apigw.send(new GetResourcesCommand({ restApiId: apiId }))
                .then(function (response)
                {
                    const root = _.find(response.items, function (r) { return r.path === '/'; });
                    rootId = root.id;

                    // PutMethod ANY on root — tolerate "already exists".
                    return apigw.send(new PutMethodCommand({
                        restApiId: apiId, resourceId: rootId,
                        httpMethod: 'ANY', authorizationType: 'NONE'
                    }))
                    .catch(function (err)
                    {
                        if (err.name === 'ConflictException') { return null; }
                        throw err;
                    });
                })
                .then(function ()
                {
                    // Proxy integration — Lambda is always invoked via POST.
                    return apigw.send(new PutIntegrationCommand({
                        restApiId: apiId, resourceId: rootId, httpMethod: 'ANY',
                        type: 'AWS_PROXY', integrationHttpMethod: 'POST', uri: integrationUri
                    }));
                })
                .then(function ()
                {
                    // Allow API Gateway to invoke the function — tolerate existing permission.
                    return lambda.send(new AddPermissionCommand({
                        FunctionName: deploy.functionName,
                        StatementId: 'apigw-invoke-ambassador-apply',
                        Action: 'lambda:InvokeFunction',
                        Principal: 'apigateway.amazonaws.com',
                        SourceArn: 'arn:aws:execute-api:' + deploy.region + ':' + accountId + ':' + apiId + '/*/*'
                    }))
                    .catch(function (err)
                    {
                        if (err.name === 'ResourceConflictException') { return null; }
                        throw err;
                    });
                })
                .then(function ()
                {
                    // Deploy to the stage (creates/updates the stage).
                    return apigw.send(new CreateDeploymentCommand({
                        restApiId: apiId, stageName: deploy.apiStage,
                        description: 'ambassador-apply deploy ' + new Date().toISOString()
                    }));
                })
                .then(function ()
                {
                    const invokeUrl = 'https://' + apiId + '.execute-api.' + deploy.region
                        + '.amazonaws.com/' + deploy.apiStage;
                    entityos.set({ scope: 'ambassador-apply-deploy', context: 'invokeUrl', value: invokeUrl });
                    entityos.set({ scope: 'ambassador-apply-deploy', context: 'stageArn',
                        value: 'arn:aws:apigateway:' + deploy.region + '::/restapis/' + apiId + '/stages/' + deploy.apiStage });
                    console.log('  ✓ Deployed:', invokeUrl);
                    entityos.invoke('util-aws-ambassador-apply-deploy-waf');
                })
                .catch(function (err)
                {
                    entityos.invoke('util-end', 'API configure error: ' + err.message, '500');
                });
            }
        });

        // ── [14] WAF WebACL ensure + associate with stage ───────
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-deploy-waf',
            code: function ()
            {
                const deploy   = entityos.invoke('util-aws-ambassador-apply-get-deploy-settings');
                const stageArn = entityos.get({ scope: 'ambassador-apply-deploy', context: 'stageArn' });

                const {
                    WAFV2Client, ListWebACLsCommand, CreateWebACLCommand, AssociateWebACLCommand
                } = require('@aws-sdk/client-wafv2');
                const waf = new WAFV2Client(entityos.invoke('util-aws-ambassador-apply-get-config'));

                console.log('[14/14] Ensuring WAF WebACL:', deploy.webAclName, '(REGIONAL)');

                const rules = [{
                    Name: 'rate-limit-per-ip',
                    Priority: 1,
                    Statement: { RateBasedStatement: { Limit: deploy.wafRateLimit, AggregateKeyType: 'IP' } },
                    Action: { Block: {} },
                    VisibilityConfig: {
                        SampledRequestsEnabled: true,
                        CloudWatchMetricsEnabled: true,
                        MetricName: 'ambassadorApplyRateLimit'
                    }
                }];

                const associate = function (webAclArn)
                {
                    waf.send(new AssociateWebACLCommand({ WebACLArn: webAclArn, ResourceArn: stageArn }))
                    .then(function ()
                    {
                        console.log('  ✓ WebACL associated with API stage');
                        entityos.set({ scope: 'ambassador-apply-deploy', context: 'webAclArn', value: webAclArn });
                        entityos.invoke('app-process-aws-ambassador-apply-deploy-done');
                    })
                    .catch(function (err)
                    {
                        if (err.name === 'WAFAssociatedItemException' || /already/i.test(err.message || ''))
                        {
                            console.log('  ✓ WebACL already associated');
                            entityos.set({ scope: 'ambassador-apply-deploy', context: 'webAclArn', value: webAclArn });
                            entityos.invoke('app-process-aws-ambassador-apply-deploy-done');
                        }
                        else
                        {
                            entityos.invoke('util-end', 'AssociateWebACL error: ' + err.message, '500');
                        }
                    });
                };

                waf.send(new ListWebACLsCommand({ Scope: 'REGIONAL', Limit: 100 }))
                .then(function (response)
                {
                    const existing = _.find(response.WebACLs, function (w) { return w.Name === deploy.webAclName; });

                    if (existing)
                    {
                        console.log('  ✓ WebACL exists:', existing.ARN);
                        associate(existing.ARN);
                    }
                    else
                    {
                        waf.send(new CreateWebACLCommand({
                            Name: deploy.webAclName,
                            Scope: 'REGIONAL',
                            DefaultAction: { Allow: {} },
                            Rules: rules,
                            VisibilityConfig: {
                                SampledRequestsEnabled: true,
                                CloudWatchMetricsEnabled: true,
                                MetricName: 'ambassadorApplyWebAcl'
                            },
                            Description: 'Rate limiting for selfdriven.you ambassador intake'
                        }))
                        .then(function (createResp)
                        {
                            console.log('  ✓ WebACL created:', createResp.Summary.ARN);
                            associate(createResp.Summary.ARN);
                        })
                        .catch(function (err)
                        {
                            entityos.invoke('util-end', 'CreateWebACL error: ' + err.message, '500');
                        });
                    }
                })
                .catch(function (err)
                {
                    entityos.invoke('util-end', 'ListWebACLs error: ' + err.message, '500');
                });
            }
        });

        // ── Done ────────────────────────────────────────────────
        entityos.add(
        {
            name: 'app-process-aws-ambassador-apply-deploy-done',
            code: function ()
            {
                const deploy      = entityos.invoke('util-aws-ambassador-apply-get-deploy-settings');
                const functionARN = entityos.get({ scope: 'ambassador-apply-deploy', context: 'functionARN' });
                const invokeUrl   = entityos.get({ scope: 'ambassador-apply-deploy', context: 'invokeUrl' });
                const topicArn    = entityos.get({ scope: 'ambassador-apply-deploy', context: 'snsTopicArn' });
                const webAclArn   = entityos.get({ scope: 'ambassador-apply-deploy', context: 'webAclArn' });

                const responseData = {
                    status:             'deployed',
                    functionARN:        functionARN,
                    endpoint:           invokeUrl,
                    snsTopicArn:        topicArn,
                    webAclArn:          webAclArn,
                    applicationsBucket: deploy.applicationsBucket,
                    applicationsPrefix: deploy.applicationsPrefix
                };

                console.log('\n── ambassador-apply deployed ───────────');
                console.log('Endpoint:   ', invokeUrl);
                console.log('Function:   ', functionARN);
                console.log('SNS topic:  ', topicArn);
                console.log('WebACL:     ', webAclArn);
                console.log('Applications:', 's3://' + deploy.applicationsBucket + '/' + deploy.applicationsPrefix);
                console.log('────────────────────────────────────────');
                console.log('Set this endpoint as ENDPOINT in the /ambassadors page.');
                if (deploy.notifyEmail !== '')
                {
                    console.log('Note: ' + deploy.notifyEmail + ' must confirm the SNS subscription email before alerts arrive.');
                }
                console.log('');

                entityos.invoke('util-end', responseData, '200');
            }
        });
    }
};
