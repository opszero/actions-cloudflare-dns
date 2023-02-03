# Create DNS Record Action for GitHub

Creates a new CloudFlare DNS record.

## Usage via Github Actions

Add [CLOUDFLARE_TOKEN](https://developers.cloudflare.com/api/tokens/create) and CLOUDFLARE_ZONE to the [repository secrets](https://docs.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets).

```yaml
name: example
on:
  pull_request:
    type: [opened, reopened]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: rez0n/create-dns-record@v2.1
        with:
          type: "A"
          name: "review.example.com"
          content: "8.8.8.8"
          ttl: 1
          proxied: true
          token: ${{ secrets.CLOUDFLARE_TOKEN }}
          zone: ${{ secrets.CLOUDFLARE_ZONE }}
```

**Use full qualified domain name to update if it exist**

# Pro Support

<a href="https://www.opszero.com"><img src="http://assets.opszero.com/images/opszero_11_29_2016.png" width="300px"/></a>

[opsZero provides additional support](https://www.opszero.com/devops) including:

- Slack & Email support
- Zoom Calls
- Implementation
- Architecture Guidance

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).
