# @balerion/provider-upload-cloudinary

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
yarn add @balerion/provider-upload-cloudinary

# using npm
npm install @balerion/provider-upload-cloudinary --save
```

## Configuration

- `provider` defines the name of the provider
- `providerOptions` is passed down during the construction of the provider. (ex: `cloudinary.config`). [Complete list of options](https://cloudinary.com/documentation/cloudinary_sdks#configuration_parameters)
- `actionOptions` is passed directly to each method respectively allowing for custom options. You can find the complete list of [upload/ uploadStream options](https://cloudinary.com/documentation/image_upload_api_reference#upload_optional_parameters) and [delete options](https://cloudinary.com/documentation/image_upload_api_reference#destroy_optional_parameters)

See the [documentation about using a provider](https://docs.balerion.io/developer-docs/latest/plugins/upload.html#using-a-provider) for information on installing and using a provider. To understand how environment variables are used in Balerion, please refer to the [documentation about environment variables](https://docs.balerion.io/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.html#environment-variables).

### Provider Configuration

`./config/plugins.js`

```js
module.exports = ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
  // ...
});
```

### Security Middleware Configuration

Due to the default settings in the Balerion Security Middleware you will need to modify the `contentSecurityPolicy` settings to properly see thumbnail previews in the Media Library. You should replace `balerion::security` string with the object bellow instead as explained in the [middleware configuration](https://docs.balerion.io/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.html#loading-order) documentation.

`./config/middlewares.js`

```js
module.exports = [
  // ...
  {
    name: 'balerion::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'market-assets.balerion.io', 'res.cloudinary.com'],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.balerion.io',
            'res.cloudinary.com',
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  // ...
];
```
