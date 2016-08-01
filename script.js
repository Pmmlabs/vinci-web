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

    $('#fileUpload').attr('action', PROXY + endpoints['preload']).find('input').change(function() {
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = document.createElement('img');
            img.onload = function() {
                if (this.width < 200 || this.height < 200) {
                    alert('Изображение должно быть больше чем 200x200')
                }
                else if ((this.width > 1080 || this.height > 1440) && (this.height > 1080 || this.width > 1440)) {
                    alert('Изображение должно быть меньше чем 1080x1440')
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(this.files[0])
    });

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