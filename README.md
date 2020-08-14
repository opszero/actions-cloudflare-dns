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
      - uses: rez0n/create-dns-record@v2
        with:
          type: "A"
          name: "review.example.com"
          content: "10.10.10.10"
          ttl: 1
          proxied: true
          token: ${{ secrets.CLOUDFLARE_TOKEN }}
          zone: ${{ secrets.CLOUDFLARE_ZONE }}
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).
