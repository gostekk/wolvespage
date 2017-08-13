function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function refreshTable(table) {
  await sleep(400);
  $(table).bootstrapTable('refresh');
}

admins = {
  showNotification: function (notifyType, msg) {
    $.notify({
      icon: 'notifications',
      message: msg,
    }, {
      type: notifyType,
      timer: 3000,
      placement: {
        from: 'top',
        align: 'center',
      },
    });
  },

  showSwal: function (type) {
    if (type == 'success-message') {
      swal({
        title: 'Good job!',
        text: 'You clicked the button!',
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-success',
        type: 'success',
      });

    } else if (type == 'refreshplayers') {
      swal({
        title: 'Updating things!',
        text: 'Wait a second.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        timer: 1000,
        showConfirmButton: false,
      }).then(
        function () {},

        // handling the promise rejection
        function (dismiss) {
          if (dismiss === 'timer') {
            refreshTable('#playersTable');
          }
        }
      );
    }
  },
};
