'use strict';

angular.module('common').controller('SoundController', 
	['$scope', '$modalInstance', '$routeParams', '$http', 
                     function ($scope, $modalInstance, $routeParams, $http) {
	
	$scope.systemSounds = [];
    $scope.uploadSounds = [];

    $scope.isCollapsed1 = false;
    $scope.isCollapsed2 = true;
    $scope.isCollapsed3 = true;
    $scope.isCollapsed4 = true;
    $scope.isCollapsed5 = true;
    $scope.isCollapsed6 = true;
    
    $scope.main_menu = "사람";
    $scope.menu = "";

    $scope.searchWord = '';
    
    $scope.init = function() {
        $routeParams.type = 'default';
        $routeParams.main = '사람';

        $scope.systemSounds = $scope.findSounds($routeParams.type, $routeParams.main, $routeParams.sub);
    };
    
    $scope.findSounds = function(type, main, sub) {

        //var url = '/api/sound/browse';
        if (!type)
            type = 'default';

        //url += ('/' + type);

        if (main) {
            $scope.main_menu = main;
            //url += ('/' + encodeURIComponent(main));
            if (sub) {
                $scope.menu = sub;
                //url += ('/' + encodeURIComponent(sub));
            } else {
                $scope.menu = '';
            }
        }

        //console.log("Sound URL : " + url);
        //alert("Sound URL : " + url);
//         $http({method: 'GET', url: url}).
//             success(function(data,status) {
//                 $scope.systemSounds = [];
//                 for (var i in data) {
//                     var sound = data[i];
//                     var path = '/uploads/' + sound.filename.substring(0,2)+'/'+sound.filename.substring(2,4)+'/'+sound.filename+sound.ext;
// 
//                     Entry.soundQueue.loadFile({
//                         id: sound._id,
//                         src: path,
//                         type: createjs.LoadQueue.SOUND
//                     });
// 
//                     sound.selected = 'boxOuter';
//                     for (var j in $scope.selectedSystem) {
//                         if ($scope.selectedSystem[j]._id === sound._id) {
//                             sound.selected = 'boxOuter selected';
//                             break;
//                         }
//                     }
// 
//                     $scope.systemSounds.push(sound);
// 
//                 }
//             }).
//             error(function(data, status) {
//                 $scope.status = status;
//             });

        var soundResourceMap = 'resource_map/' + 'sounds.json'; 
        
        if (fs.existsSync(soundResourceMap)) {
            var data = fs.readFileSync(soundResourceMap, "utf8");
        }  
        console.log(data);
        $scope.systemSounds = [];
        
        data = JSON.parse(data); 
        for (var i in data) {
            var sound = data[i];
            //console.log(sound);
            //console.log(sound.filename);
        
            var path = '/uploads/' + sound.filename.substring(0,2)+'/'+sound.filename.substring(2,4)+'/'+sound.filename+sound.ext;
        
            console.log(path);

            Entry.soundQueue.loadFile({
                id: sound._id,
                src: path,
                type: createjs.LoadQueue.SOUND
            });

            sound.selected = 'boxOuter';
            for (var j in $scope.selectedSystem) {
                if ($scope.selectedSystem[j]._id === sound._id) {
                    sound.selected = 'boxOuter selected';
                    break;
                }
            }

            $scope.systemSounds.push(sound);
        }

    };

    $scope.search = function() {
        $scope.searchWord = $('#searchWord').val();
        if (!$scope.searchWord || $scope.searchWord == '') {
            alert('검색어를 입력하세요.');
            return false;
        }

        var url = '/api/sound/search/'+$scope.searchWord;
        $http({method: 'GET', url: url}).
            success(function(data,status) {
                $scope.systemSounds = [];
                for (var i in data) {
                    var sound = data[i];
                    var path = '/uploads/' + sound.filename.substring(0,2)+'/'+sound.filename.substring(2,4)+'/'+sound.filename+sound.ext;

                    Entry.soundQueue.loadFile({
                        id: sound._id,
                        src: path,
                        type: createjs.LoadQueue.SOUND
                    });

                    sound.selected = 'boxOuter';
                    for (var j in $scope.selectedSystem) {
                        if ($scope.selectedSystem[j]._id === sound._id) {
                            sound.selected = 'boxOuter selected';
                            break;
                        }
                    }

                    $scope.systemSounds.push(sound);

                }

                $scope.collapse(0);
                $scope.main_menu = '';
            }).
            error(function(data, status) {
                $scope.status = status;
            });

    };


    $scope.upload = function() {
        var uploadFile = document.getElementById("uploadFile").files;

        if (!uploadFile) {
            alert('파일은 필수입력 항목입니다.');
            return false;
        }

        if (uploadFile.length > 10) {
            alert('한번에 10개까지 업로드가 가능합니다.');
            return false;
        }

        for (var i=0, len=uploadFile.length; i<len; i++) {
            var file = uploadFile[i];

            //var isAudio = (/^audio\/mp3/).test(file.type);
            var isAudio = file.name.toLowerCase().indexOf('.mp3') + file.name.toLowerCase().indexOf('.wav');
            if (isAudio < 0) {
                alert('MP3, WAV 파일만 등록이 가능합니다.');
                return false;
            }

            if (file.size > 1024*1024*10) {
                alert('10MB 이하만 업로드가 가능합니다.');
                return false;
            }
        }

        $scope.$apply(function() {
            $scope.isUploading = true;
        });

        var formData = new FormData();
        formData.append("type", "user");
        for (var i=0, len=uploadFile.length; i<len; i++) {
            var file = uploadFile[i];
            formData.append("uploadFile"+i, file);

        }
        $scope.uploadSoundFile(formData);

    };

    $scope.uploadSoundFile = function(formData) {

        $.ajax({
            url: '/api/sound/upload',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST',
            success: function(data) {
                $scope.$apply(function() {
                    $scope.isUploading = false;
                    data.forEach(function(item) {
                        var path = '/uploads/' + item.filename.substring(0,2)+'/'+
                            item.filename.substring(2,4)+'/'+item.filename+item.ext;
                        Entry.soundQueue.loadFile({
                            id: item._id,
                            src: path,
                            type: createjs.LoadQueue.SOUND
                        });

                        $scope.uploadSounds.push(item);

                        //if ($scope.loadings && $scope.loadings.length > 0)
                        //    $scope.loadings.splice(0,1);

                    });

                });
            },
            error: function() {
                $scope.apply(function() {
                    $scope.isUploading = false;
                    alert(Lang.Msgs.error_occured);
                });
            }
        });
    };

    /*
    $scope.makeLoadings = function(count) {
        $scope.loadings = [];
        for (var i=0; i<count; i++)
            $scope.loadings.push(i);
    };
    */

    $scope.collapse = function(dest) {
        for (var i=1; i<10; i++)
            $scope['isCollapsed' + i] = true;

        if (dest > 0) {
            $scope['isCollapsed' + dest] = false;
            $('#searchWord').val('');
        }
    };

    // 현재 선택한 탭
    $scope.currentTab = 'system'; //for modal(sprite,upload,paint,character,text,etc)

    $scope.selectedSystem = [];
    $scope.selectedUpload = [];
    $scope.currentIndex = 0;
    // 선택
    $scope.selectSystem = function(sound) {
        var path = '/uploads/' + sound.filename.substring(0,2)+'/'+sound.filename.substring(2,4)+'/'+sound.filename+sound.ext;

        var selected = true;
        for (var i in $scope.selectedSystem) {
            var item = $scope.selectedSystem[i];
            if (item._id === sound._id) {
                $scope.selectedSystem.splice(i,1);
                selected = false;
            }
        }

        if (selected) {
            createjs.Sound.play(sound._id);
            $scope.selectedSystem.push(sound);
            // 스프라이트 다중 선택.
            var elements = jQuery('.boxOuter').each(function() {
                var element = jQuery(this);
                if (element.attr('id') === sound._id) {
                    element.attr('class', 'boxOuter selected');
                }
            });
        } else {
            createjs.Sound.stop();
            var elements = jQuery('.boxOuter').each(function() {
                var element = jQuery(this);
                if (element.attr('id') === sound._id) {
                    element.attr('class', 'boxOuter');
                }
            });
        }
    };

    $scope.moveContainer = function (direction) {
        if ($scope.selectedSystem.length <=5)
            return;

        var mover = jQuery('.modal_selected_container_moving').eq(0);
        var sounds = $scope.selectedSystem;
        if (direction == 'left') {
            if ($scope.currentIndex+2 > sounds.length)
                return;
            $scope.currentIndex++;
            mover.animate({
                marginLeft: '-=106px',
                duration: '0.2'
            },function(){});
        } else {
            if ($scope.currentIndex-1 < 0)
                return;
            $scope.currentIndex--;
            mover.animate({
                marginLeft: '+=106px',
                duration: '0.2'
            },function(){});
        }
    }

    $scope.applySystem = function(sound) {
        $scope.selectedSystem = [];
        $scope.selectedSystem.push(sound);

        $modalInstance.close({
            target: $scope.currentTab,
            data: $scope.currentSelected()
        });
    };

    $scope.selectUpload = function(sound) {
        var path = '/uploads/' + sound.filename.substring(0,2)+'/'+sound.filename.substring(2,4)+'/'+sound.filename+sound.ext;

        var selected = true;
        for (var i in $scope.selectedUpload) {
            var item = $scope.selectedUpload[i];
            if (item._id === sound._id) {
                $scope.selectedUpload.splice(i,1);
                selected = false;
            }
        }

        if (selected) {
            $scope.selectedUpload.push(sound);
            createjs.Sound.play(sound._id);
            // 스프라이트 다중 선택.
            var elements = jQuery('.boxOuter').each(function() {
                var element = jQuery(this);
                if (element.attr('id') === sound._id) {
                    element.attr('class', 'boxOuter selected');
                }
            });
        } else {
            createjs.Sound.stop();
            var elements = jQuery('.boxOuter').each(function() {
                var element = jQuery(this);
                if (element.attr('id') === sound._id) {
                    element.attr('class', 'boxOuter');
                }
            });
        }
    };

    $scope.applyUpload = function(sound) {
        $scope.selectedUpload = [];
        $scope.selectedUpload.push(sound);

        $modalInstance.close({
            target: $scope.currentTab,
            data: $scope.currentSelected()
        });
    };

    // 탭 이동
    $scope.changeTab = function(tab) {
        $scope.currentIndex = 0;
        var mover = jQuery('.modal_selected_container_moving').eq(0);
        mover.css('margin-left', 0);
        $scope.currentTab = tab;
    };

    $scope.currentSelected = function() {
        if ($scope.currentTab === 'system') {
            return $scope.selectedSystem;
        } else if ($scope.currentTab === 'upload') {
            return $scope.selectedUpload;
        } else if ($scope.currentTab === 'textBox') {
            return 'textBox';
        } else {
            return null;
        }
    };

    // 적용
    $scope.ok = function () {
        if (!$scope.currentSelected()) {
            alert(Lang.Workspace.select_sprite);
        } else {
            $modalInstance.close({
                target: $scope.currentTab,
                data: $scope.currentSelected()
            });
        }
        createjs.Sound.stop();
    };

    // 취소
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
        createjs.Sound.stop();
    };
    
		
}]);