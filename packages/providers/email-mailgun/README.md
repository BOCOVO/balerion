# @balerion/provider-email-mailgun

## Resources

- [LICENSE](LICENSE)

## Links

- [Balerion website](https://balerion.io/)
- [Balerion documentation](https://docs.balerion.io)
- [Balerion community on Discord](https://discord.balerion.io)
- [Balerion news on Twitter](https://twitter.com/balerionjs)

## Installation

```bash
# using yarn
yarn add @balerion/provider-email-mailgun

# using npm
npm install @balerion/provider-email-mailgun --save
```

## Configuration

| Variable                | Type                    | Description                                                                                                                        | Required | Default   |
| ----------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------- | --------- |
| provider                | string                  | The name of the provider you use                                                                                                   | yes      |           |
| providerOptions         | object                  | Will be directly given to the `require('mailgun.js')`. Please refer to [mailgun.js](https://www.npmjs.com/package/mailgun.js) doc. | yes      |           |
| settings                | object                  | Settings                                                                                                                           | no       | {}        |
| settings.defaultFrom    | string                  | Default sender mail address                                                                                                        | no       | undefined |
| settings.defaultReplyTo | string \| array<string> | Default address or addresses the receiver is asked to reply to                                                                     | no       | undefined |

> :warning: The Shipper Email (or defaultfrom) may also need to be changed in the `Email Templates` tab on the admin panel for emails to send properly

Since [mailgun-js](https://www.npmjs.com/package/mailgun-js) has been deprecated, this package now uses `mailgun.js` instead. In an effort to avoid breaking changes methods were added to convert existing configuration objects to work with the new package.

### Example

**Path -** `config/plugins.js`

```js
module.exports = ({ env }) => ({
  // ...
  email: {
    config: {
      provider: 'mailgun',
      providerOptions: {
        key: env('MAILGUN_API_KEY'), // Required
        domain: env('MAILGUN_DOMAIN'), // Required
        url: env('MAILGUN_URL', 'https://api.mailgun.net'), //Optional. If domain region is Europe use 'https://api.eu.mailgun.net'
      },
      settings: {
        defaultFrom: 'myemail@protonmail.com',
        defaultReplyTo: 'myemail@protonmail.com',
      },
    },
  },
  // ...
});
```
