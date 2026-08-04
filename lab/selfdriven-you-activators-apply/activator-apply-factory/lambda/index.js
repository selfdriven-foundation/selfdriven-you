'use strict';

var entityos = require('entityos');
var factory  = require('./infrastructurefactory-activator-apply');

factory.init({});

entityos.add(
{
    name: 'util-end',
    code: function (response)
    {
        const resolve = entityos.get({ scope: 'activator-apply', context: '_resolve' });
        if (resolve) { resolve(response); }
    }
});

exports.handler = async function (event)
{
    return new Promise(function (resolve)
    {
        entityos.set({ scope: 'activator-apply', context: '_resolve', value: resolve });
        entityos.set({ scope: '_event', value: event });

        entityos.set(
        {
            scope: '_settings',
            value:
            {
                infrastructure:
                {
                    aws:
                    {
                        region: process.env.AWS_REGION || 'ap-southeast-2',
                        allowedOrigin: process.env.ALLOWED_ORIGIN || '*',
                        s3:
                        {
                            bucket: process.env.APPLICATIONS_BUCKET,
                            prefix: process.env.APPLICATIONS_PREFIX || 'applications/'
                        },
                        sns:
                        {
                            topicArn: process.env.SNS_TOPIC_ARN
                        }
                    }
                }
            }
        });

        entityos.invoke('util-aws-activator-apply-route');
    });
};
