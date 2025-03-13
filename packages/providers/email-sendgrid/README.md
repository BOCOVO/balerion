# @balerion/provider-email-sendgrid

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
yarn add @balerion/provider-email-sendgrid

# using npm
npm install @balerion/provider-email-sendgrid --save
```

## Configuration

| Variable                | Type                    | Description                                                                                                             | Required | Default   |
| ----------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------- | --------- |
| provider                | string                  | The name of the provider you use                                                                                        | yes      |           |
| providerOptions         | object                  | Provider options                                                                                                        | yes      |           |
| providerOptions.apiKey  | object                  | Api key given to the function setApiKey. Please refer to [@sendgrid/mail](https://www.npmjs.com/package/@sendgrid/mail) | yes      |           |
| settings                | object                  | Settings                                                                                                                | no       | {}        |
| settings.defaultFrom    | string                  | Default sender mail address                                                                                             | no       | undefined |
| settings.defaultReplyTo | string \| array<string> | Default address or addresses the receiver is asked to reply to                                                          | no       | undefined |

> :warning: The Shipper Email (or defaultfrom) may also need to be changed in the `Email Templates` tab on the admin panel for emails to send properly

### Example

**Path -** `config/plugins.js`

```js
module.exports = ({ env }) => ({
  // ...
  email: {
    config: {
      provider: 'sendgrid',
      providerOptions: {
        apiKey: env('SENDGRID_API_KEY'),
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
