# Specdocular Upload Action

Upload an OpenAPI description to the [Specdocular](https://specdocular.com) platform from any CI.

This is a generic uploader. It does not generate a spec and knows nothing about how one was
produced. Generate your OpenAPI document with any tool (or hand-write it), then hand the file to
this action. The same posture as `codecov/codecov-action`: one step that ships an artifact you
already built.

## Usage

```yaml
- uses: specdocular/upload-action@v1
  with:
    file: openapi.json
    project-slug: my-project
    token: ${{ secrets.SPECDOCULAR_TOKEN }}
```

A typical job generates the spec in an earlier step, then uploads it:

```yaml
jobs:
  publish-spec:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # ... your own step that writes openapi.json ...
      - uses: specdocular/upload-action@v1
        with:
          file: openapi.json
          project-slug: my-project
          token: ${{ secrets.SPECDOCULAR_TOKEN }}
```

## Inputs

| input | required | default | description |
|---|---|---|---|
| `file` | yes | | Path to the OpenAPI description document. |
| `project-slug` | yes | | The Specdocular project the spec belongs to. |
| `token` | yes | | The project CI ingest token. Store it as a repository secret. |
| `platform-url` | no | `https://specdocular.com` | Override the platform origin (staging or self-review). |
| `commit` | no | `$GITHUB_SHA` | The commit SHA. |
| `branch` | no | the workflow branch | The branch name. |
| `generator-name` | no | | Optional producer name recorded as provenance. |
| `generator-version` | no | | Optional producer version recorded as provenance. |

## Outputs

| output | description |
|---|---|
| `api-description-version-id` | The id of the created (or existing, on dedup) API description version. |
| `api-description-version-url` | The URL of the created version. Empty on a deduplicated upload. |
| `dedup` | `"true"` when the platform already had this exact spec, `"false"` otherwise. |

## Safe to re-run

Uploads are idempotent. Re-running a job that delivers the identical spec is harmless: the platform
recognises it and returns the existing version with `dedup: "true"`, firing no duplicate processing.
Use GitHub's native re-run button freely.

## Where to get the token

Mint a CI ingest token in your project's settings on the platform, and store it as a repository
secret (the `token` input above).

## Raw POST fallback

The action is a convenience wrapper over a public HTTP endpoint. If you would rather not use it, you
can `POST` the same envelope yourself to `/api/v1/projects/{project-slug}/builds` with a
`Authorization: Bearer <token>` header. The action assembles that request for you.
