# TLS certificates

Place the production certificate files here before starting Nginx:

- `fullchain.pem`
- `privkey.pem`

For Cloudflare Origin Certificates, create one certificate covering:

- `soundz.uz`
- `www.soundz.uz`
- `admin.soundz.uz`
- `api.soundz.uz`

Never commit real private keys. The certificate files are ignored by Git.
