const PROXY = 'https://cors-pmmlabs.rhcloud.com/';
var endpoints = {
    'list': 'http://vinci.camera/list',
    'preload': 'http://vinci.camera/preload',
    'process': 'http://vinci.camera/process'
}
    , square = false
    , cropImg
    , filters;

function renderResults(result) {
    var row = $('#thumbs');
    row.empty();
    $('input').val('');
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
}

function onError() {
    alert('Ошибка загрузки! Попробуйте файл поменьше.');
}

$(function () {
    $.get(PROXY + endpoints['list'], function (_filters) {
        filters = _filters;
    });

    $('#fileUpload').attr('action', PROXY + endpoints['preload']).find('input').change(function () {
        var reader = new FileReader();
        reader.onload = function (e) {
            cropImg = document.createElement('img');
            cropImg.onload = function () {
                square = Math.abs(this.width - this.height) < 10;
                var big = (this.width > 1080 || this.height > 1440) && (this.height > 1080 || this.width > 1440);
                if (this.width < 200 || this.height < 200) {
                    alert('Изображение должно быть больше чем 200x200')
                } else if (!square || big) {
                    $('#crop').html(this);
                    $(this).cropper({
                        aspectRatio: 1,
                        viewMode: 2,
                        autoCropArea: 1,
                        minCropBoxWidth: 200,
                        minCropBoxHeight: 200
                    });
                    if (big)
                        $(cropImg).cropper('scale', 1080 / this.width).cropper('zoomTo', 1);
                }
            };
            cropImg.src = e.target.result;
        };
        reader.readAsDataURL(this.files[0])
    });

    $('#submit').click(function () {
        if (square)
            $('#fileUpload').ajaxSubmit({
                success: renderResults,
                error: onError
            });
        else {
            $(cropImg).cropper('getCroppedCanvas').toBlob(function (blob) {
                var formData = new FormData();
                formData.append('photo', blob);
                $('#crop').empty();
                $.ajax(PROXY + endpoints['preload'], {
                    method: "POST",
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: renderResults,
                    error: onError
                });
            }, 'image/jpeg');
        }
    });
});