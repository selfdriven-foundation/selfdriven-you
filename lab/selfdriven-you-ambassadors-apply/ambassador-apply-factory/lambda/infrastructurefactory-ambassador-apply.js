var entityos = require('entityos');
var _ = require('lodash');
var crypto = require('crypto');

module.exports =
{
    VERSION: '1.1.0',

    init: function (param)
    {
        // ── Config ──────────────────────────────────────────────
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-get-config',
            code: function ()
            {
                const settings = entityos.get({ scope: '_settings' });

                const config = {
                    region: _.get(settings, 'infrastructure.aws.region',
                            process.env.AWS_REGION || 'ap-southeast-2')
                };

                const accessId = _.get(settings, 'infrastructure.aws.access.id');
                if (accessId && accessId !== 'iam-role')
                {
                    config.credentials = {
                        accessKeyId:     accessId,
                        secretAccessKey: _.get(settings, 'infrastructure.aws.access.secret')
                    };
                }

                return config;
            }
        });

        // ── CORS headers ────────────────────────────────────────
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-cors-headers',
            code: function ()
            {
                const settings = entityos.get({ scope: '_settings' });
                const origin = _.get(settings, 'infrastructure.aws.allowedOrigin',
                        process.env.ALLOWED_ORIGIN || '*');

                return {
                    'Access-Control-Allow-Origin':  origin,
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                };
            }
        });

        // ── JSON response builder (with CORS) ───────────────────
        entityos.add(
        {
            name: 'util-response-json',
            code: function (param)
            {
                return {
                    statusCode: _.get(param, 'status', 200),
                    headers: _.assign(
                        { 'Content-Type': 'application/json' },
                        entityos.invoke('util-aws-ambassador-apply-cors-headers')
                    ),
                    body: JSON.stringify(_.get(param, 'body', {}))
                };
            }
        });

        // ── Router ──────────────────────────────────────────────
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-route',
            code: function ()
            {
                const event = entityos.get({ scope: '_event' });

                const method = (_.get(event, 'requestContext.http.method')
                    || _.get(event, 'httpMethod')
                    || 'POST').toUpperCase();

                const rawPath = _.get(event, 'requestContext.http.path')
                    || _.get(event, 'rawPath')
                    || _.get(event, 'path')
                    || '/';

                console.log('[ambassador-apply] ' + method + ' ' + rawPath);

                if (method === 'OPTIONS')
                {
                    entityos.invoke('util-end', {
                        statusCode: 204,
                        headers: entityos.invoke('util-aws-ambassador-apply-cors-headers'),
                        body: ''
                    });
                }
                else if (method === 'POST')
                {
                    entityos.invoke('util-aws-ambassador-apply-submit');
                }
                else
                {
                    entityos.invoke('util-end',
                        entityos.invoke('util-response-json', {
                            body: { ok: false, error: 'method_not_allowed' },
                            status: 405
                        })
                    );
                }
            }
        });

        // ── Field cleaner ───────────────────────────────────────
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-clean',
            code: function (param)
            {
                const value = _.get(param, 'value');
                const max = _.get(param, 'max', 2000);
                if (typeof value !== 'string') { return ''; }
                return value.trim().slice(0, max);
            }
        });

        // ── Reference generator (AMB-XXXXX) ─────────────────────
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-make-ref',
            code: function ()
            {
                const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                const bytes = crypto.randomBytes(5);
                let out = '';
                for (let i = 0; i < 5; i++) { out += chars[bytes[i] % chars.length]; }
                return 'AMB-' + out;
            }
        });

        // ── IP extraction ───────────────────────────────────────
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-ip-get',
            code: function ()
            {
                const event = entityos.get({ scope: '_event' });

                return _.get(event, 'requestContext.http.sourceIp')
                    || _.get(event, 'requestContext.identity.sourceIp')
                    || (_.get(event, 'headers.x-forwarded-for') || '').split(',')[0].trim()
                    || null;
            }
        });

        // ── Submit handler: parse, validate, chain to save ──────
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-submit',
            code: function ()
            {
                const event = entityos.get({ scope: '_event' });

                let raw = _.get(event, 'body', '{}');
                if (_.get(event, 'isBase64Encoded'))
                {
                    raw = Buffer.from(raw, 'base64').toString('utf8');
                }

                let payload;
                try
                {
                    payload = JSON.parse(raw);
                }
                catch (err)
                {
                    entityos.invoke('util-end',
                        entityos.invoke('util-response-json', {
                            body: { ok: false, error: 'invalid_json' },
                            status: 400
                        })
                    );
                    return;
                }

                const clean = function (value, max)
                {
                    return entityos.invoke('util-aws-ambassador-apply-clean', { value: value, max: max });
                };

                const name     = clean(payload.name, 200);
                const email    = clean(payload.email, 320);
                const location = clean(payload.location, 200);
                const why      = clean(payload.why, 4000);
                const hours    = clean(payload.hours, 100);
                const mode     = clean(payload.mode, 40);
                const settings = _.isArray(payload.settings)
                    ? _.map(payload.settings.slice(0, 12), function (s) { return clean(s, 60); })
                    : [];

                if (name === '')
                {
                    entityos.invoke('util-end',
                        entityos.invoke('util-response-json', {
                            body: { ok: false, error: 'name_required' },
                            status: 400
                        })
                    );
                    return;
                }

                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                {
                    entityos.invoke('util-end',
                        entityos.invoke('util-response-json', {
                            body: { ok: false, error: 'email_invalid' },
                            status: 400
                        })
                    );
                    return;
                }

                const ref = entityos.invoke('util-aws-ambassador-apply-make-ref');
                const now = new Date();

                const record = {
                    ref:         ref,
                    submittedAt: now.toISOString(),
                    name:        name,
                    email:       email,
                    location:    location,
                    settings:    settings,
                    mode:        mode,
                    why:         why,
                    hours:       hours,
                    source:      'selfdriven.you/ambassadors',
                    meta: {
                        ip:        entityos.invoke('util-aws-ambassador-apply-ip-get'),
                        userAgent: _.get(event, 'requestContext.http.userAgent')
                                    || _.get(event, 'requestContext.identity.userAgent')
                                    || null
                    }
                };

                entityos.invoke('util-aws-ambassador-apply-record-save', { ref: ref, record: record, now: now });
            }
        });

        // ── S3 save ─────────────────────────────────────────────
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-record-save',
            code: function (param)
            {
                const ref    = _.get(param, 'ref');
                const record = _.get(param, 'record');
                const now    = _.get(param, 'now');

                const settings = entityos.get({ scope: '_settings' });
                const bucket = _.get(settings, 'infrastructure.aws.s3.bucket', process.env.APPLICATIONS_BUCKET);
                const prefix = _.get(settings, 'infrastructure.aws.s3.prefix', process.env.APPLICATIONS_PREFIX || 'applications/');

                if (bucket == undefined)
                {
                    console.error('[ambassador-apply] APPLICATIONS_BUCKET not configured');
                    entityos.invoke('util-end',
                        entityos.invoke('util-response-json', {
                            body: { ok: false, error: 'server_not_configured' },
                            status: 500
                        })
                    );
                    return;
                }

                const yyyy = now.getUTCFullYear();
                const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
                const s3Key = prefix + yyyy + '/' + mm + '/' + ref + '.json';

                const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
                const s3 = new S3Client(entityos.invoke('util-aws-ambassador-apply-get-config'));

                s3.send(new PutObjectCommand({
                    Bucket:               bucket,
                    Key:                  s3Key,
                    Body:                 JSON.stringify(record, null, 2),
                    ContentType:          'application/json',
                    ServerSideEncryption: 'AES256',
                    Metadata:             { ref: ref, email: record.email }
                }))
                .then(function ()
                {
                    console.log('[ambassador-apply] saved ref=' + ref + ' email=' + record.email + ' key=' + s3Key);
                    // Fire the alert, then respond. Alert failure never fails the request.
                    entityos.invoke('util-aws-ambassador-apply-notify', {
                        ref: ref, record: record, bucket: bucket, key: s3Key
                    });
                })
                .catch(function (err)
                {
                    console.error('[ambassador-apply] PutObject error:', err);
                    entityos.invoke('util-end',
                        entityos.invoke('util-response-json', {
                            body: { ok: false, error: 'save_failed' },
                            status: 500
                        })
                    );
                });
            }
        });

        // ── SNS notify (prose email), then respond ──────────────
        entityos.add(
        {
            name: 'util-aws-ambassador-apply-notify',
            code: function (param)
            {
                const ref    = _.get(param, 'ref');
                const record = _.get(param, 'record');
                const bucket = _.get(param, 'bucket');
                const key    = _.get(param, 'key');

                const settings = entityos.get({ scope: '_settings' });
                const topicArn = _.get(settings, 'infrastructure.aws.sns.topicArn', process.env.SNS_TOPIC_ARN);

                const respond = function ()
                {
                    entityos.invoke('util-end',
                        entityos.invoke('util-response-json', {
                            body: { ok: true, ref: ref },
                            status: 200
                        })
                    );
                };

                // No topic configured — just respond.
                if (topicArn == undefined || topicArn === '')
                {
                    respond();
                    return;
                }

                const settingsList = (record.settings && record.settings.length)
                    ? record.settings.join(', ') : 'none selected';
                const niceDate = new Date(record.submittedAt).toUTCString();

                const message =
                    'A new ambassador application has come in.\n\n' +
                    record.name + ' (' + record.email + ') applied on ' + niceDate + '.\n' +
                    'Based in: ' + (record.location || 'not given') + '.\n' +
                    'Settings they would carry it into: ' + settingsList + '.\n' +
                    'Mode they are in most: ' + (record.mode || 'not given') + '.\n' +
                    'Time they can give: ' + (record.hours || 'not given') + '.\n\n' +
                    'Why they want to join:\n' +
                    (record.why || 'not given') + '\n\n' +
                    'Reference: ' + ref + '\n' +
                    'Stored at: s3://' + bucket + '/' + key + '\n';

                let subject = 'New ambassador application — ' + record.name + ' (' + ref + ')';
                if (subject.length > 100) { subject = subject.slice(0, 99); }

                const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
                const sns = new SNSClient(entityos.invoke('util-aws-ambassador-apply-get-config'));

                sns.send(new PublishCommand({
                    TopicArn: topicArn,
                    Subject:  subject,
                    Message:  message
                }))
                .then(function ()
                {
                    console.log('[ambassador-apply] alert published ref=' + ref);
                    respond();
                })
                .catch(function (err)
                {
                    // Application is already saved — log and still return success.
                    console.error('[ambassador-apply] SNS publish error (application saved):', err);
                    respond();
                });
            }
        });
    }
};
