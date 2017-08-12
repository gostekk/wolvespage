function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function refreshTable(table) {
  await sleep(400);
  $(table).bootstrapTable('refresh');
}

admins = {
  showNotification: function(notifyType, msg){
    	$.notify({
        	icon: "notifications",
        	message: msg,
        },{
            type: notifyType,
            timer: 3000,
            placement: {
                from: 'top',
                align: 'center'
            }
        });
	}
}
