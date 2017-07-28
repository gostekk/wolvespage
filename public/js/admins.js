function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function refreshTable() {
  await sleep(400);
  $('#playersTable').bootstrapTable('refresh');
}
