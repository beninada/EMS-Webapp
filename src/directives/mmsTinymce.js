'use strict';

angular.module('mms.directives')
.directive('mmsTinymce', ['ElementService', 'ViewService', 'CacheService', '$modal', '$templateCache', '$window', '$timeout', 'growl', 'tinymce', mmsTinymce]);

/**
 * @ngdoc directive
 * @name mms.directives.directive:mmsTinymce
 * @element textarea
 *
 * @requires mms.ElementService
 * @requires mms.ViewService
 * @requires $modal
 * @requires $templateCache
 * @requires $window
 * @requires $timeout
 * @requires growl
 *
 * @restrict A
 *
 * @description
 * Make any textarea with an ngModel attached to be a tinymce wysiwyg editor. This
 * requires the tinymce library. Transclusion is supported. ngModel is required.
 * ### Example
 * <pre>
   <textarea mms-tinymce ng-model="element.documentation"></textarea>
   </pre>
 *
 * @param {Array=} mmsCfElements Array of element objects as returned by ElementService
 *      that can be transcluded. Regardless, transclusion allows keyword searching 
 *      elements to transclude from alfresco
 */
function mmsTinymce(ElementService, ViewService, CacheService, $modal, $templateCache, $window, $timeout, growl, tinymce) { //depends on angular bootstrap
    var generatedIds = 0;

    var mmsTinymceLink = function(scope, element, attrs, ngModelCtrl) {
        if (!attrs.id)
            attrs.$set('id', 'mmsTinymce' + generatedIds++);
        var instance = null;

        var autocompleteModalTemplate = $templateCache.get('mms/templates/mmsAutocompleteModal.html');
        var transcludeModalTemplate = $templateCache.get('mms/templates/mmsCfModal.html');
        var commentModalTemplate = $templateCache.get('mms/templates/mmsCommentModal.html');
        var chooseImageModalTemplate = $templateCache.get('mms/templates/mmsChooseImageModal.html');
        var viewLinkModalTemplate = $templateCache.get('mms/templates/mmsViewLinkModal.html');
        var proposeModalTemplate = $templateCache.get('mms/templates/mmsProposeModal.html');

        var transcludeCtrl = function($scope, $modalInstance) {
            var autocompleteName;
            var autocompleteProperty;
            var autocompleteElementId;

            $scope.cacheElements = CacheService.getLatestElements(scope.mmsWs);
            $scope.autocompleteItems = [];

            $scope.cacheElements.forEach(function(cacheElement) {
                $scope.autocompleteItems.push({ 'sysmlid' : cacheElement.sysmlid, 'name' : cacheElement.name + ' name' });
                $scope.autocompleteItems.push({ 'sysmlid' : cacheElement.sysmlid, 'name' : cacheElement.name + ' documentation' });

                if (cacheElement.specialization.type === 'Property') {
                    $scope.autocompleteItems.push({ 'sysmlid' : cacheElement.sysmlid, 'name' : cacheElement.name + ' value' });
                }
            });

            $scope.searchClass = "";
            $scope.proposeClass = "";
            var originalElements = $scope.mmsCfElements;
            $scope.filter = '';
            $scope.searchText = '';
            $scope.newE = {name: '', documentation: ''};
            $scope.searchSuccess = false;
            $scope.requestName = false;
            $scope.requestDocumentation = false;
            $scope.choose = function(elementId, property, name) {
                var tag = '<mms-transclude-' + property + ' data-mms-eid="' + elementId + '">[cf:' + name + '.' + property + ']</mms-transclude-' + property + '> ';
                $modalInstance.close(tag);
            };
            $scope.cancel = function() {
                $modalInstance.dismiss();
            };
            $scope.search = function(searchText) {
                //var searchText = $scope.searchText; //TODO investigate why searchText isn't in $scope
                //growl.info("Searching...");
                $scope.searchClass = "fa fa-spin fa-spinner";
                // ElementService.search(searchText, false, scope.mmsWs)
                // .then(function(data) {
                    $scope.searchSuccess = true;
                    // $scope.mmsCfElements = data;

                    // MOCK DATA - DELETE THIS DECL
                    $scope.mmsCfElements =
[
    {
        "sysmlid": "2345",
        "name": "Flight System (ELEMENT)",
        "documentation": "blah",
        "qualifiedName": "/q/Flight System",
        "properties":[
            {
                "sysmlid": "3434243",
                "name": "mix",
                "qualifiedName": "/q/Flight System/mass",
                "documentation": "mass of flight system",
                "specialization": {
                    "type": "Property",
                    "isSlot": false,
                    "value": [{"type": "LiteralReal", "double": 45.2}, {"type": "LiteralString", "string": "bam"}, {"type": "LiteralInteger", "integer": 12}]
                }
             },
             {
                "sysmlid": "34342422",
                "name": "afid",
                "qualifiedName": "/q/Flight System//",
                "documentation": "",
                "specialization": {
                    "type": "Property",
                    "isSlot": false,
                    "value": [{"type": "LiteralString", "string": "123"}]
                }
             }
         ],
         "specialization": {
             "type": "Element"
         }
    },
    {
        "sysmlid": "1421421",
        "name": "Rocket (ELEMENT)",
        "documentation": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at lobortis. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur. Etiam porta sem malesuada magna mollis euismod. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.",
        "qualifiedName": "/q/Rocket",
        "properties":[
            {
                "sysmlid": "3434243",
                "name": "mass",
                "qualifiedName": "/q/Flight System/mass",
                "documentation": "mass of flight system",
                "specialization": {
                    "type": "Property",
                    "isSlot": false,
                    "value": [{"type": "LiteralReal", "double": 45.2}]
                }
             },
             {
                "sysmlid": "34342422",
                "name": "afid",
                "qualifiedName": "/q/Flight System//",
                "documentation": "",
                "specialization": {
                    "type": "Property",
                    "isSlot": false,
                    "value": [{"type": "LiteralString", "string": "123"}]
                }
             },
             {
                "sysmlid": "12421421",
                "qualifiedName": "/q/Flight System//",
                "documentation": "",
                "specialization": {
                    "type": "Property",
                    "isSlot": true,
                    "propertyType": "MMS_1408982971725_a9873a09-adad-4fd1-935c-9fe1eab8ed4c",
                    "value": [{"type": "LiteralUnlimitedNatural", "naturalValue": 45}]
                }
             },
             {
                "sysmlid": "34342422",
                "name": "width",
                "qualifiedName": "/q/Flight System//",
                "documentation": "",
                "specialization": {
                    "type": "Property",
                    "isSlot": false,
                    "value": [{"type": "LiteralInteger", "integer": 3490}]
                }
             },
             {
                "sysmlid": "135513513",
                "qualifiedName": "/q/Flight System//",
                "documentation": "",
                "specialization": {
                    "type": "Property",
                    "isSlot": true,
                    "propertyType": "MMS_1408982971725_a9873a09-adad-4fd1-935c-9fe1eab8ed4c",
                    "value": [{"type": "LiteralReal", "double": 150.2}]
                }
             },
             {
                "sysmlid": "34342422",
                "name": "acceleration",
                "qualifiedName": "/q/Flight System//",
                "documentation": "",
                "specialization": {
                    "type": "Property",
                    "isSlot": false,
                    "value": [{"type": "OpaqueExpression", "expressionBody": ["expr1", "expr2", "des1", "des2"] }]
                }
             },
             {
                "sysmlid": "34342422",
                "name": "angle",
                "qualifiedName": "/q/Flight System//",
                "documentation": "",
                "specialization": {
                    "type": "Property",
                    "isSlot": false,
                    "value": [{"type": "LiteralInteger", "integer": 149}]
                }
             },
             {
                "sysmlid": "34342422",
                "name": "diameter",
                "qualifiedName": "/q/Flight System//",
                "documentation": "",
                "specialization": {
                    "type": "Property",
                    "isSlot": false,
                    "value": [{"type": "ElementValue", "element": "MMS_1408982971725_a9873a09-adad-4fd1-935c-9fe1eab8ed4c"}]
                }
             },
             {
                "sysmlid": "34342422",
                "name": "rotation",
                "qualifiedName": "/q/Flight System//",
                "documentation": "",
                "specialization": {
                    "type": "Property",
                    "isSlot": false,
                    "value": [{"type": "LiteralString", "string": "123"}]
                }
             },
             {
                "sysmlid": "34342422",
                "name": "momentum",
                "qualifiedName": "/q/Flight System//",
                "documentation": "",
                "specialization": {
                    "type": "Property",
                    "isSlot": false,
                    "value": [{"type": "LiteralString", "string": "123"}]
                }
             }
         ],
         "specialization": {
             "type": "Element"
         }
    },
    {
        "sysmlid": "2345",
        "name": "Flight System (CONSTRAINT)",
        "documentation": "blah",
        "qualifiedName": "/q/Flight System",
        "specialization": {
            "type": "Constraint",
            "specification": {
                "type": "OpaqueExpression",
                "expressionBody": [ "bam", "bammmm", "bammm", "bam!!", "huzzaahh"]
            }
        }
    },
    {
        "sysmlid": "2345",
        "name": "Wiring (CONSTRAINT)",
        "documentation": "blah",
        "qualifiedName": "/q/Flight System",
        "specialization": {
            "type": "Constraint",
            "specification": {
                "type": "OpaqueExpression",
                "string": "hello world"
            }
        }
    },
    {
        "sysmlid": "34342422",
        "qualifiedName": "/q/Flight System//",
        "documentation": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at lobortis.",
        "specialization": {
            "type": "Property",
            "isSlot": true,
            "propertyType": "MMS_1408982971725_a9873a09-adad-4fd1-935c-9fe1eab8ed4c",
            "value": [{"type": "LiteralString", "string": "123"}]
        }
    },
    {
        "sysmlid": "34342422",
        "name": "afid (PROPERTY W/ NAME)",
        "qualifiedName": "/q/Flight System//",
        "documentation": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at lobortis. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at lobortis. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at lobortis. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at lobortis. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at lobortis. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at lobortis. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur. ",
        "specialization": {
            "type": "Property",
            "isSlot": false,
            "value": [{"type": "LiteralString", "string": "123"}]
        }
    },
    {
        "sysmlid": "34342422",
        "name": "bam (PROPERTY W/ NAME)",
        "qualifiedName": "/q/Flight System//",
        "documentation": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at lobortis. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at lobortis. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at lobortis. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at lobortis. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at lobortis. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at lobortis. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur. ",
        "specialization": {
            "type": "Property",
            "isSlot": false,
            "value": [{"type": "LiteralString", "string": "123"}, {"type": "LiteralString", "string": "123"}, {"type": "LiteralString", "string": "123"}, {"type": "LiteralString", "string": "123"}, {"type": "LiteralString", "string": "123"}, {"type": "LiteralString", "string": "123"}]
        }
    }
];

                // change properties arr to 2-dim to display table
                $scope.mmsCfElements.forEach(function(elem) {
                    if (elem.specialization.type === 'Element' && elem.properties[0]) {
                        var properties = [];
                        for (var i = 0; i < elem.properties.length; i++) {
                            if (i % 3 === 0) {
                                properties.push([]);
                            }
                            properties[properties.length-1].push(elem.properties[i]);
                        }
                        elem.properties = properties;
                    }
                });

                //     $scope.searchClass = "";
                // }, function(reason) {
                //     growl.error("Search Error: " + reason.message);
                //     $scope.searchClass = "";
                // });
            };
            $scope.openProposeModal = function() {
                $modalInstance.close(false);
            };
            $scope.makeNew = function() {
                $scope.proposeClass = "fa fa-spin fa-spinner";
                ElementService.createElement({name: $scope.newE.name, documentation: $scope.newE.documentation, specialization: {type: 'Element'}}, scope.mmsWs, scope.mmsSite)
                .then(function(data) {
                    $scope.mmsCfElements = [data];
                    $scope.proposeClass = "";
                }, function(reason) {
                    growl.error("Propose Error: " + reason.message);
                    $scope.proposeClass = "";
                });
            };
            $scope.makeNewAndChoose = function() {
                if (!$scope.newE.name) {
                    growl.error('Error: A name for your new element is required.');
                    return;
                } else if (!$scope.requestName && !$scope.requestDocumentation) {
                    growl.error('Error: Selection of a property to cross-reference is required.');
                    return;
                }

                $scope.proposeClass = "fa fa-spin fa-spinner";
                ElementService.createElement({name: $scope.newE.name, documentation: $scope.newE.documentation, specialization: {type: 'Element'}}, scope.mmsWs, scope.mmsSite)
                .then(function(data) {
                    if ($scope.requestName) {
                        $scope.choose(data.sysmlid, 'name', $scope.newE.name);
                    } else if ($scope.requestDocumentation) {
                        $scope.choose(data.sysmlid, 'doc', $scope.newE.name);
                    }
                    $scope.proposeClass = "";
                }, function(reason) {
                    growl.error("Propose Error: " + reason.message);
                    $scope.proposeClass = "";
                });
            };
            $scope.showOriginalElements = function() {
                $scope.mmsCfElements = originalElements;
            };
            $scope.toggleRadio = function(field) {
                if (field === "name") {
                    $scope.requestName = true;
                    $scope.requestDocumentation = false;
                } else if (field === "documentation") {
                    $scope.requestName = false;
                    $scope.requestDocumentation = true;
                }
            };
            $scope.autocompleteOnSelect = function($item, $model, $label) {
                autocompleteElementId = $item.sysmlid;

                var lastIndexOfName = $item.name.lastIndexOf(" ");
                autocompleteName = $item.name.substring(0, lastIndexOfName);

                var property = $label.split(' ');
                property = property[property.length - 1];

                if (property === 'name') {
                    autocompleteProperty = 'name';
                } else if (property === 'documentation') {
                    autocompleteProperty = 'doc';
                } else if (property === 'value') {
                    autocompleteProperty = 'val';
                }
            };
            $scope.autocomplete = function(success) {
                if (success) {
                    var tag = '<mms-transclude-' + autocompleteProperty + ' data-mms-eid="' + autocompleteElementId + '">[cf:' + autocompleteName + '.' + autocompleteProperty + ']</mms-transclude-' + autocompleteProperty + '> ';
                    $modalInstance.close(tag);
                } else {
                    $modalInstance.close(false);
                }
            };
        };

        var autocompleteCallback = function(ed) {
            var instance = $modal.open({
                template: autocompleteModalTemplate,
                scope: scope,
                controller: ['$scope', '$modalInstance', transcludeCtrl],
                size: 'sm'
            });

            $timeout(function() {
                angular.element('.autocomplete-modal-typeahead').focus();
            });

            instance.result.then(function(tag) {
                if (!tag) {
                    transcludeCallback(ed, true);
                } else {
                    ed.execCommand('delete');
                    ed.selection.collapse(false);
                    ed.insertContent(tag);
                }
            }, function() {
                ed.focus();
            });
        };

        var transcludeCallback = function(ed, fromAutocomplete) {
            var instance = $modal.open({
                template: transcludeModalTemplate,
                scope: scope,
                controller: ['$scope', '$modalInstance', transcludeCtrl],
                size: 'lg'
            });
            instance.result.then(function(tag) {
                if (!tag) {
                    proposeCallback(ed);
                    return;
                }

                if (fromAutocomplete) {
                    ed.execCommand('delete');
                }

                ed.selection.collapse(false);
                ed.insertContent(tag);
            }, function() {
                ed.focus();
            });
        };

        var proposeCallback = function(ed) {
            var instance = $modal.open({
                template: proposeModalTemplate,
                scope: scope,
                controller: ['$scope', '$modalInstance', transcludeCtrl],
                size: 'lg'
            });
            instance.result.then(function(tag) {
                ed.selection.collapse(false);
                ed.insertContent(tag);
            });
        };

        var transcludeViewLinkCtrl = function($scope, $modalInstance) {
            $scope.searchClass = "";
            $scope.proposeClass = "";
            $scope.filter = '';
            $scope.searchText = '';
            $scope.mmsCfViewElements = [];
            $scope.choose = function(elementId, name) {
                var tag = '<mms-view-link data-mms-vid="' + elementId + '">[cf:' + name + '.vlink]</mms-view-link> ';
                $modalInstance.close(tag);
            };
            $scope.cancel = function() {
                $modalInstance.dismiss();
            };
            $scope.search = function(searchText) {
                //var searchText = $scope.searchText; //TODO investigate why searchText isn't in $scope
                //growl.info("Searching...");
                $scope.searchClass = "fa fa-spin fa-spinner";
                ElementService.search(searchText, false, scope.mmsWs)
                .then(function(data) {
                    var views = [];
                    data.forEach(function(v) {
                        if (v.specialization && (v.specialization.type === 'View' || v.specialization.type === 'Product'))
                            views.push(v);
                    });
                    $scope.mmsCfViewElements = views;
                    $scope.searchClass = "";
                }, function(reason) {
                    growl.error("Search Error: " + reason.message);
                    $scope.searchClass = "";
                });
            };
        };

        var viewLinkCallback = function(ed) {
            var instance = $modal.open({
                template: viewLinkModalTemplate,
                scope: scope,
                controller: ['$scope', '$modalInstance', transcludeViewLinkCtrl],
                size: 'lg'
            });
            instance.result.then(function(tag) {
                ed.selection.collapse(false);
                ed.insertContent(tag);
            });
        };

        var commentCtrl = function($scope, $modalInstance) {
            $scope.comment = {
                name: '', 
                documentation: '', 
                specialization: {
                    type: 'Comment'
                }
            };
            $scope.oking = false;
            $scope.ok = function() {
                if ($scope.oking) {
                    growl.info("Please wait...");
                    return;
                }
                $scope.oking = true;
                if (ViewService.getCurrentViewId())
                    $scope.comment.owner = ViewService.getCurrentViewId();
                ElementService.createElement($scope.comment, scope.mmsWs)
                .then(function(data) {
                    var tag = '<mms-transclude-com data-mms-eid="' + data.sysmlid + '">comment:' + data.creator + '</mms-transclude-com> ';
                    $modalInstance.close(tag);
                }, function(reason) {
                    growl.error("Comment Error: " + reason.message);
                }).finally(function() {
                    $scope.oking = false;
                });
            };
            $scope.cancel = function() {
                $modalInstance.dismiss();
            };
        };

        var commentCallback = function(ed) {
            var instance = $modal.open({
                template: commentModalTemplate,
                scope: scope,
                controller: ['$scope', '$modalInstance', commentCtrl]
            });
            instance.result.then(function(tag) {
                ed.selection.collapse(false);
                ed.insertContent(tag);
            });
        };

        var imageCtrl = function($scope, $modalInstance) {
            $scope.fileChanged = function(input) {
                var file = input.files[0];
                var reader = new $window.FileReader();
                reader.onload = function() {
                    var data = reader.result;
                    $scope.image.src = data;
                };
                reader.readAsDataURL(file);
            };
            $scope.image = {src: ''};
            $scope.ok = function() {
                $modalInstance.close($scope.image);
            };
            $scope.cancel = function() {
                $modalInstance.dismiss();
            };
        };

        var imageCallback = function(callback, value, meta) {
            angular.element('#mce-modal-block').css('z-index', 98);
            var tinymceModalId = $window.tinymce.activeEditor.windowManager.getWindows()[0]._id;
            angular.element('#' + tinymceModalId).css('z-index', 99);
            var instance = $modal.open({
                template: chooseImageModalTemplate,
                scope: scope,
                controller: ['$scope', '$modalInstance', imageCtrl]
            });
            instance.result.then(function(image) {
                callback(image.src);
            }, function() {
                callback('');
            });
        };

        var update = function() {
            ngModelCtrl.$setViewValue(element.val());
        };

        var options = {
            plugins: 'autoresize charmap code fullscreen image link media nonbreaking paste table textcolor searchreplace',
            toolbar: 'bold italic underline strikethrough | subscript superscript blockquote | formatselect | fontsizeselect | forecolor backcolor removeformat | alignleft aligncenter alignright | bullist numlist outdent indent | table | link unlink | image media | charmap searchreplace code | transclude comment vlink normalize | mvleft mvright | undo redo',
            menubar: false,
            statusbar: true,
            nonbreaking_force_tab: true,
            selector: '#' + attrs.id,
            autoresize_max_height: $window.innerHeight*0.65,
            paste_retain_style_properties: 'color background-color font-size text-align',
            browser_spellcheck: true,
            invalid_elements: 'br,div,font',
            extended_valid_elements: 'seqr-timely,mms-site-docs,mms-workspace-docs,mms-diagram-block,mms-view-link,-mms-transclude-doc,-mms-transclude-name,-mms-transclude-com,-mms-transclude-val,-mms-transclude-img,math,maction,maligngroup,malignmark,menclose,merror,mfenced,mfrac,mglyph,mi,mlabeledtr,mlongdiv,mmultiscripts,mn,mo,mover,mpadded,mphantom,mroot,mrow,ms,mscarries,mscarry,msgroup,mstack,msline,mspace,msqrt,msrow,mstyle,msub,msup,msubsup,mtable,mtd,mtext,mtr,munder,munderover',
            custom_elements: 'seqr-timely,mms-site-docs,mms-workspace-docs,mms-diagram-block,~mms-view-link,~mms-transclude-doc,~mms-transclude-name,~mms-transclude-com,~mms-transclude-val,~mms-transclude-img,math,maction,maligngroup,malignmark,menclose,merror,mfenced,mfrac,mglyph,mi,mlabeledtr,mlongdiv,mmultiscripts,mn,mo,mover,mpadded,mphantom,mroot,mrow,ms,mscarries,mscarry,msgroup,mstack,msline,mspace,msqrt,msrow,mstyle,msub,msup,msubsup,mtable,mtd,mtext,mtr,munder,munderover',
            fix_list_elements: true,
            content_css: 'css/partials/mms.min.css',
            paste_data_images: true,
            skin_url: 'lib/tinymce/skin/lightgray',
            file_picker_callback: imageCallback,
            file_picker_types: 'image',
            setup: function(ed) {
                ed.addButton('transclude', {
                    title: 'Cross Reference',
                    text: 'Cf',
                    onclick: function() {
                        transcludeCallback(ed, false);
                    }
                });
                ed.addButton('comment', {
                    title: 'Comment',
                    text: 'Comment',
                    onclick: function() {
                        commentCallback(ed);
                    }
                });
                ed.addButton('vlink', {
                    title: 'Insert View Link',
                    text: 'Cf View',
                    onclick: function() {
                        viewLinkCallback(ed);
                    }
                });
                ed.addButton('mvleft', {
                    title: 'Move Left of Cf',
                    text: '<-',
                    onclick: function() {
                        var node = ed.selection.getEnd();
                        if (node.nodeName.substr(0,3) === 'MMS') {
                            var space = ed.getDoc().createTextNode('#');
                            var parent = node.parentNode;
                            parent.insertBefore(space, node);
                            ed.selection.select(space);
                        }
                    }
                });
                ed.addButton('mvright', {
                    title: 'Move Right of Cf',
                    text: '->',
                    onclick: function() {
                        var node = ed.selection.getEnd();
                        if (node.nodeName.substr(0,3) === 'MMS') {
                            var space = ed.getDoc().createTextNode('#');
                            var parent = node.parentNode;
                            parent.insertBefore(space, node.nextSibling);
                            ed.selection.select(space);
                        }
                    }
                });
                ed.addButton('normalize', {
                    title: 'Reset Cross References',
                    text: 'Reset Cf',
                    onclick: function() {
                        var body = ed.getBody();
                        body = angular.element(body);
                        body.find('mms-transclude-name').html('[cf:name]');
                        body.find('mms-transclude-doc').html('[cf:doc]');
                        body.find('mms-transclude-val').html('[cf:val]');
                        body.find('mms-view-link').html('[cf:vlink]');
                        ed.save();
                        update();
                    }
                });
                ed.on('init', function(args) {
                    ngModelCtrl.$render();
                    ngModelCtrl.$setPristine();
                });
                ed.on('change', function(e) {
                    ed.save();
                    update();
                });
                ed.on('undo', function(e) {
                    ed.save();
                    update();
                });
                ed.on('redo', function(e) {
                    ed.save();
                    update();
                });
                ed.on('blur', function(e) {
                    element.blur();
                });
                ed.on('keydown', function(e) {
                    if (e.keyCode === 9) { 
                        if (e.shiftKey) 
                            ed.execCommand('Outdent');
                        else 
                            ed.execCommand('Indent');
                        e.preventDefault();
                        return false;
                    }  
                });
                ed.on('keypress', function(e) {
                    if (e.keyCode === 64) {
                        autocompleteCallback(ed);
                    }
                });
                if (scope.mmsTinymceApi) {
                    scope.mmsTinymceApi.save = function() {
                        ed.save();
                        update();
                    };
                }
            }
        };

        $timeout(function() {
            tinymce.init(options);
        });

        ngModelCtrl.$render = function() {
            if (!instance)
                instance = tinymce.get(attrs.id);
            if (instance) {
                instance.setContent(ngModelCtrl.$viewValue || '');
                instance.undoManager.clear();
                var doc = instance.getDoc().documentElement;
                if (instance.dom.getStyle(doc, 'overflow-y', true) !== 'auto')
                    instance.dom.setStyle(doc, 'overflow-y', 'auto');
                var iframe = instance.getContainer().getElementsByTagName('iframe')[0];
                if (instance.dom.getStyle(iframe, 'height', true) === '0px')
                    instance.dom.setStyle(iframe, 'height', $window.innerHeight*0.65);
            }
        };

        scope.$on('$destroy', function() {
            if (!instance)
                instance = tinymce.get(attrs.id);
            if (instance) {
                instance.remove();
                instance = null;
            }
        });
    };

    return {
        priority: 10,
        restrict: 'A',
        require: 'ngModel',
        scope: {
            mmsCfElements: '=',
            mmsEid: '@',
            mmsWs: '@',
            mmsSite: '@',
            mmsTinymceApi: '='
        },
        link: mmsTinymceLink
    };
}
