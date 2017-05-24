const PROXY = 'https://cors-pmmlabs.rhcloud.com/';
var endpoints = {
    'list': 'http://vinci.camera/list',
    'preload': 'http://vinci.camera/preload',
    'process': 'http://vinci.camera/process'
}
    , big = false
    , cropImg
    , filters
    , hidden_filters
    , row;

function add_images(filter_set, image_id, sup) {
    for (var i in filter_set) {
        var src = PROXY + endpoints['process'] + '/' + image_id + '/' + filter_set[i].id;
        row.append($('<div class="col-xs-6 col-md-3">\
                        <a href="' + src + '" class="thumbnail" data-lightbox="image" data-title="' + filter_set[i].name + '">\
                            <img onerror="if (!~this.src.indexOf(\'?????\')) this.src+=\'?\'" src="' + src + '">\
                        </a>\
                        <p class="text-center">' + filter_set[i].name + (sup ? '<sup>'+sup+'</sup>' : '') + '</p>\
                    </div>'));
    }
}

function renderResults(result) {
    row.empty();
    $('input').val('');
    add_images(filters, result.preload);
    add_images(hidden_filters, result.preload, '&#128065;');
    if (!lightbox.containerBottomPadding)
        lightbox.init();
}

function onError() {
    alert('Ошибка загрузки! Попробуйте файл поменьше.');
}

if (!HTMLCanvasElement.prototype.toBlob) {
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value: function (callback, type, quality) {
            var binStr = atob( this.toDataURL(type, quality || 0.6).split(',')[1] ),
                len = binStr.length,
                arr = new Uint8Array(len);

            for (var i=0; i<len; i++ ) {
                arr[i] = binStr.charCodeAt(i);
            }
            callback( new Blob( [arr], {type: type || 'image/jpeg'} ) );
        }
    });
}

$(function () {
    row = $('#thumbs');
    $.getJSON(PROXY + endpoints['list'], function (_filters) {
        filters = _filters;
    });
    $.getJSON('hidden_filters.json', function(_hidden_filters) {
        hidden_filters = _hidden_filters;
    });
    $('#fileUpload').attr('action', PROXY + endpoints['preload']).find('input').change(function () {
        var reader = new FileReader();
        reader.onload = function (e) {
            cropImg = document.createElement('img');
            cropImg.onload = function () {
                big = (this.width > 1080 || this.height > 1440) && (this.height > 1080 || this.width > 1440);
                if (this.width < 200 || this.height < 200) {
                    alert('Изображение должно быть больше чем 200x200')
                } else if (big) {
                    $('#crop').html(this);
                    $(this).cropper({
                        viewMode: 2,
                        autoCropArea: 1,
                        minCropBoxWidth: 200,
                        minCropBoxHeight: 200
                    });
                    $(cropImg).cropper('scale', (this.width ? $('#crop').width() / this.width : $('#crop').height() / this.height)).cropper('zoomTo', 1);
                }
            };
            cropImg.src = e.target.result;
        };
        reader.readAsDataURL(this.files[0])
    });

    $('#submit').click(function () {
        if (!big)
            $('#fileUpload').ajaxSubmit({
                success: renderResults,
                error: onError
            });
        else {
            $(cropImg).cropper('getCroppedCanvas').toBlob(function (blob) {
                var formData = new FormData();
                formData.append('photo.jpg', blob, 'photo.jpg');
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
