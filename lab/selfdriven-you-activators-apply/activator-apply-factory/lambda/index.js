'use strict';

var entityos = require('entityos');
var factory  = require('./infrastructurefactory-activator-apply');

factory.init({});

// The Promise resolver for the in-flight request. Held in a module-scoped
// variable rather than in entityos state so the async bridge never depends on
// entityos get/set semantics (which vary between entityos versions and can drop
// underscore-prefixed keys). This is what prevents a hung Promise → Runtime.NodeJsExit.
var activeResolve = null;

entityos.add(
{
    name: 'util-end',
    code: function (response)
    {
        if (activeResolve)
        {
            var resolve = activeResolve;
            activeResolve = null;
            resolve(response);
        }
    }
});

exports.handler = async function (event)
{
    return new Promise(function (resolve)
    {
        activeResolve = resolve;

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

        // entityos 2.x reads data.settings.testing on every invoke; ensure it exists.
        if (entityos.data.settings == undefined)
        {
            entityos.data.settings = { testing: { status: 'false' } };
        }

        // Any synchronous throw in routing must reject (settle) the Promise rather
        // than leave it hanging — a hung Promise surfaces as Runtime.NodeJsExit / 502.
        try
        {
            entityos.invoke('util-aws-activator-apply-route');
        }
        catch (err)
        {
            var origin = process.env.ALLOWED_ORIGIN || '*';
            resolve({
                statusCode: 500,
                headers:
                {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin':  origin,
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                body: JSON.stringify({ ok: false, error: 'handler_error', detail: err.message })
            });
        }
    });
};
