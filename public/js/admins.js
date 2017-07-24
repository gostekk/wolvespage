var $table = $('#statsTable');

$(function () {
  $('#getAllSelections').click(function (e) {

    var formURL = $('#addgameForm').attr('action');
    var data = {};
    data.teamname = $('input[name=name]').val();
    data.teamlogo = $('input[name=logo]').val();
    data.date = $('input[name=date]').val();
    data.players = $('#statsTable').bootstrapTable('getAllSelections');
    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: formURL,
      success: function (data, textStatus, jqXHR) {
        console.log('success');
        if (data.redirect == 'reload') {
          window.location.reload();
        } else if (typeof (data.redirect == 'string')) {
          window.location = data.redirect;
        }
      },
    });
    e.preventDefault();
  });
});
