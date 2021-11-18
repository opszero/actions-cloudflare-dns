/**
 * Create CloudFlare DNS Record Action for GitHub
 * https://github.com/marketplace/actions/cloudflare-create-dns-record
 */

const path = require("path");
const cp = require("child_process");

const core = require('@actions/core');
const github = require('@actions/github');

const getCurrentRecordId = () => {
  //https://api.cloudflare.com/#dns-records-for-a-zone-list-dns-records
  const { status, stdout } = cp.spawnSync("curl", [
    ...["--header", `Authorization: Bearer ${core.getInput('token')}`],
    ...["--header", "Content-Type: application/json"],
    `https://api.cloudflare.com/client/v4/zones/${core.getInput('zone')}/dns_records`,
  ]);

  if (status !== 0) {
    process.exit(status);
  }

  const { success, result, errors } = JSON.parse(stdout.toString());

  if (!success) {
    console.log(`::error ::${errors[0].message}`);
    process.exit(1);
  }

  const name = core.getInput('name');
  const record = result.find((x) => x.id === name);

  console.log(result)
  console.log(result[0].id)

  if (!record) {
    return null
  }

  return record.id;
};

const createRecord = () => {
  // https://api.cloudflare.com/#dns-records-for-a-zone-create-dns-record
  const { status, stdout } = cp.spawnSync("curl", [
    ...["--request", "POST"],
    ...["--header", `Authorization: Bearer ${core.getInput('token')}`],
    ...["--header", "Content-Type: application/json"],
    ...["--silent", "--data"],
    JSON.stringify({
      type: core.getInput('type'),
      name: core.getInput('name'),
      content: core.getInput('content'),
      ttl: Number(core.getInput('ttl')),
      proxied: core.getInput('proxied') == "true",
    }),
    `https://api.cloudflare.com/client/v4/zones/${core.getInput('zone')}/dns_records`,
  ]);

  if (status !== 0) {
    process.exit(status);
  }
  const { success, result, errors } = JSON.parse(stdout.toString());

  if (!success) {
    console.dir(errors[0]);
    console.log(`::error ::${errors[0].message}`);
    process.exit(1);
  }

  console.log(`::set-output name=id::${result.id}`);
  console.log(`::set-output name=name::${result.name}`);
};

const updateRecord = (id) => {
  console.log(`Record exists with ${id}, updating...`);
  // https://api.cloudflare.com/#dns-records-for-a-zone-update-dns-record
  const { status, stdout } = cp.spawnSync("curl", [
    ...["--request", "PUT"],
    ...["--header", `Authorization: Bearer ${core.getInput('token')}`],
    ...["--header", "Content-Type: application/json"],
    ...["--silent", "--data"],
    JSON.stringify({
      type: core.getInput('type'),
      name: core.getInput('name'),
      content: core.getInput('content'),
      ttl: Number(core.getInput('ttl')),
      proxied: core.getInput('proxied') == "true",
    }),
    `https://api.cloudflare.com/client/v4/zones/${core.getInput('zone')}/dns_records/${id}`,
  ]);

  if (status !== 0) {
    process.exit(status);
  }

  const { success, result, errors } = JSON.parse(stdout.toString());

  if (!success) {
    console.dir(errors[0]);
    console.log(`::error ::${errors[0].message}`);
    process.exit(1);
  }

  console.log(`::set-output name=record_id::${result.id}`);
  console.log(`::set-output name=name::${result.name}`);
}

try {
  const id = getCurrentRecordId();
  if (id) {
    updateRecord(id);
  } else {
    createRecord();
  }
} catch(err) {
  core.setFailed(`Action failed with error ${err}`);
}

