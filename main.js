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
  const record = result.find((x) => x.name == name);

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
  console.log(`Checking if record with id ${id} exists...`);
  // https://api.cloudflare.com/#dns-records-for-a-zone-get-dns-record
  const { getStatus, getStdout } = cp.spawnSync("curl", [
    ...["--request", "GET"],
    ...["--header", `Authorization: Bearer ${core.getInput('token')}`],
    `https://api.cloudflare.com/client/v4/zones/${core.getInput('zone')}/dns_records/${id}`,
  ]);

  if (getStatus !== 0) {
    process.exit(getStatus);
  }

  const { getSuccess, getResult, GetErrors } = JSON.parse(getStdout.toString());

  if (!getSuccess) {
    console.dir(GetErrors[0]);
    console.log(`::error ::${GetErrors[0].message}`);
    process.exit(1);
  }

  if (getResult) {
    console.log(`Record with id ${id} exists, deleting...`);
    // https://api.cloudflare.com/#dns-records-for-a-zone-delete-dns-record
    const { deleteStatus, deleteStdout } = cp.spawnSync("curl", [
      ...["--request", "DELETE"],
      ...["--header", `Authorization: Bearer ${core.getInput('token')}`],
      `https://api.cloudflare.com/client/v4/zones/${core.getInput('zone')}/dns_records/${id}`,
    ]);

    if (deleteStatus !== 0) {
      process.exit(deleteStatus);
    }

    const { deleteSuccess, deleteErrors } = JSON.parse(deleteStdout.toString());

    if (!deleteSuccess) {
      console.dir(deleteErrors[0]);
      console.log(`::error ::${deleteErrors[0].message}`);
      process.exit(1);
    }

    console.log(`Record with id ${id} has been deleted.`);
  }

  console.log(`Adding new record...`);
  // https://api.cloudflare.com/#dns-records-for-a-zone-create-dns-record
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

  core.setOutput("record_id", result.id);
  core.setOutput("name", result.name);
  console.log(`New record with id ${result.id} has been added.`);
}


try {
  const id = getCurrentRecordId();
  if (id) {
    updateRecord(id);
  } else {
    createRecord();
  }
} catch (err) {
  core.setFailed(`Action failed with error ${err}`);
}

