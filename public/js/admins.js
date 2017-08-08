function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function refreshTable(table) {
  await sleep(400);
  $(table).bootstrapTable('refresh');
}
