const PROXY = 'https://cors-pmmlabs.rhcloud.com/';
var endpoints = {
    'list': 'http://vinci.camera/list',
    'preload': 'http://vinci.camera/preload',
    'process': 'http://vinci.camera/process'
};
var filters;
$(function () {
    $.get(PROXY + endpoints['list'], function (_filters) {
        filters = _filters;
    });

    $('#fileUpload').attr('action', PROXY + endpoints['preload']);
    $('#submit').click(function () {
        $('#fileUpload').ajaxSubmit(function (result) {
            var row = $('#thumbs');
            row.empty();
            for (var i in filters) {
                var src = endpoints['process'] + '/' + result.preload + '/' + filters[i].id;
                row.append($('<div class="col-xs-6 col-md-3">\
                    <a href="' + src + '" class="thumbnail" data-lightbox="image" data-title="' + filters[i].name + '">\
                        <img src="' + src + '">\
                    </a>\
                    <p>' + filters[i].name + '</p>\
                </div>'));
            }
            lightbox.init();
        });
    });
});