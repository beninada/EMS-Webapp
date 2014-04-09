/*!
 * froala_editor v1.1.3 (http://editor.froala.com)
 * Copyright 2014-2014 Froala
 */

if (typeof jQuery === "undefined") { throw new Error("Froala requires jQuery") }

/*jslint browser: true, debug: true, vars: true, devel: true, expr: true, jQuery: true */

!function ($) {

    "use strict"; // jshint ;_;
    /*global Range, Modernizr, XDomainRequest */

    // EDITABLE CLASS DEFINITION
    // =========================

    var Editable = function (element, options) {

        // Set options
        this.options = $.extend({}, Editable.DEFAULTS, $(element).data(), typeof options == 'object' && options);

        // Find out browser
        this.browser = Editable.browser();

        // List of disabled options.
        this.disabledList = [];
        
        this._id = ++Editable.count;

        // Init.
        this.init(element);
    };
    
    Editable.count = 0;

    Editable.VALID_NODES = ['P', 'PRE', 'BLOCKQUOTE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV'];

    Editable.COLORS = [
                        '#000000', '#444444', '#666666', '#999999', '#CCCCCC', '#EEEEEE', '#F3F3F3', '#FFFFFF',
                        '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#9900FF', '#FF00FF',
                        '#F4CCCC', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#D0E0E3', '#CFE2F3', '#D9D2E9', '#EAD1DC',
                        '#EA9999', '#F9CB9C', '#FFE599', '#B6D7A8', '#A2C4C9', '#9FC5E8', '#B4A7D6', '#D5A6BD',
                        '#E06666', '#F6B26B', '#FFD966', '#93C47D', '#76A5AF', '#6FA8DC', '#8E7CC3', '#C27BA0',
                        '#CC0000', '#E69138', '#F1C232', '#6AA84F', '#45818E', '#3D85C6', '#674EA7', '#A64D79',
                        '#990000', '#B45F06', '#BF9000', '#38771D', '#134F5C', '#0B5394', '#351C75', '#741B47',
                        '#660000', '#783F04', '#7F6000', '#274E13', '#0C343D', '#073763', '#201211', '#4C1130'
                        ];
                        
    Editable.image_commands = {
      floatImageLeft: {
        title: 'Float Left',
        icon: {
          type: 'font',
          value: 'fa fa-align-left'
        }
      },
      
      floatImageNone: {
        title: 'Float None',
        icon: {
          type: 'font',
          value: 'fa fa-align-justify'
        }
      },
      
      floatImageRight: {
        title: 'Float Right',
        icon: {
          type: 'font',
          value: 'fa fa-align-right'
        }
      },
      
      linkImage: {
        title: 'Insert Link',
        icon: {
          type: 'font',
          value: 'fa fa-link'
        }
      },
      
      replaceImage: {
        title: 'Replace Image',
        icon: {
          type: 'font',
          value: 'fa fa-exchange'
        }
      },
      
      removeImage: {
        title: 'Remove Image',
        icon: {
          type: 'font',
          value: 'fa fa-trash-o'
        }
      },
    }

    Editable.commands = {
        bold: {
            title: 'Bold',
            icon: 'fa fa-bold',
            shortcut: '(Ctrl + B)'
        },

        italic: {
            title: 'Italic',
            icon: 'fa fa-italic',
            shortcut: '(Ctrl + I)'
        },

        underline: {
            cmd: 'underline',
            title: 'Underline',
            icon: 'fa fa-underline',
            shortcut: '(Ctrl + U)'
        },

        strikeThrough: {
            title: 'Strikethrough',
            icon: 'fa fa-strikethrough'
        },

        fontSize: {
            title: 'Font Size',
            icon: 'fa fa-text-height',
            seed:
            [
                {
                    min: 11,
                    max: 52
                }
            ]
        },

        color: {
            icon: 'fa fa-font',
            title: 'Color',
            seed:
            [
                {
                    cmd: 'backColor',
                    value: Editable.COLORS,
                    title: 'Background Color'
                },
                {
                    cmd: 'foreColor',
                    value: Editable.COLORS,
                    title: 'Text Color'
                }
            ]
        },

        formatBlock: {
            title: 'Format Block',
            icon_alt: '&para;',
            seed:
                [{
                    value: 'n',
                    title: 'Normal'
                },
                {
                    value: 'p',
                    title: 'Paragraph'
                },
                {
                    value: 'pre',
                    title: 'Code'
                },
                {
                    value: 'blockquote',
                    title: 'Quote'
                },
                {
                    value: 'h1',
                    title: 'Heading 1'
                },
                {
                    value: 'h2',
                    title: 'Heading 2'
                },
                {
                    value: 'h3',
                    title: 'Heading 3'
                },
                {
                    value: 'h4',
                    title: 'Heading 4'
                },
                {
                    value: 'h5',
                    title: 'Heading 5'
                },
                {
                    value: 'h6',
                    title: 'Heading 6'
                }
            ]
        },

        align: {
            title: 'Alignment',
            icon: 'fa fa-align-center',
            seed:
            [
                {
                    cmd: 'justifyLeft',
                    title: 'Align Left',
                    icon: 'fa fa-align-left'
                },
                {
                    cmd: 'justifyCenter',
                    title: 'Align Center',
                    icon: 'fa fa-align-center'
                },
                {
                    cmd: 'justifyRight',
                    title: 'Align Right',
                    icon: 'fa fa-align-right'
                },
                {
                    cmd: 'justifyFull',
                    title: 'Justify',
                    icon: 'fa fa-align-justify'
                }
            ]
        },

        insertOrderedList: {
            title:'Numbered List',
            icon:'fa fa-list-ol'
        },

        insertUnorderedList: {
            title:'Bulleted List',
            icon:'fa fa-list-ul'
        },

        outdent: {
            title:'Indent Less',
            icon:'fa fa-dedent',
            activeless: true,
            shortcut: '(Ctrl + <)'
        },

        indent: {
            title:'Indent More',
            icon:'fa fa-indent',
            activeless: true,
            shortcut: '(Ctrl + >)'
        },

        selectAll: {
            title:'Select All',
            icon:'fa fa-file-text',
            shortcut: '(Ctrl + A)'
        },

        createLink: {
            title:'Insert Link',
            icon:'fa fa-link',
            shortcut: '(Ctrl + K)'
        },

        insertImage: {
            title:'Insert Image',
            icon:'fa fa-picture-o',
            activeless: true,
            shortcut: '(Ctrl + P)'
        },

        undo: {
            title:'Undo',
            icon:'fa fa-undo',
            activeless: true,
            shortcut: '(Ctrl+Z)'
        },

        redo: {
            title:'Redo',
            icon:'fa fa-repeat',
            activeless: true,
            shortcut: '(Shift+Ctrl+Z)'
        },

        html: {
            title:'Show HTML',
            icon:'fa fa-code'
        },

        save: {
            title: 'Save',
            icon: 'fa fa-floppy-o'
        },
        
        insertVideo: {
            title: 'Insert Video',
            icon: 'fa fa-video-camera'
        }
    };
    
    Editable.LANGS = [];

    Editable.DEFAULTS = {
        autosave: false,
        autosaveInterval: 10000,
        saveURL: null,
        saveParams: {},
        blockTags: ['n', 'p', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        borderColor: '#252528',
        buttons: ['bold', 'italic', 'underline', 'strikeThrough', 'fontSize', 'color', 'sep', 'formatBlock', 'align',
                    'insertOrderedList', 'insertUnorderedList', 'outdent', 'indent', 'sep', 'createLink', 'insertImage',
                    'insertVideo', 'undo', 'redo', 'html'],
        crossDomain: true,
        direction: 'ltr',
        editorClass: '',
        enableScript: false,
        minHeight: 'auto',
        height: 'auto',
        imageMargin: 10,
        imageParams: {},
        imageErrorCallback: false,
        imageMove: true,
        imageUploadParam: 'file',
        imageUploadURL: 'http://i.froala.com/upload',
        imageButtons: ['floatImageLeft', 'floatImageNone', 'floatImageRight', 'linkImage', 'replaceImage', 'removeImage'],
        inverseSkin: false,
        inlineMode: true,
        paragraphy: true,
        placeholder: 'Type something',
        shortcuts: true,
        customText: false,
        spellcheck: false,
        toolbarFixed: true,
        typingTimer: 150,
        width: 'auto',
        language: 'en_us',
        customButtons: [],
        alwaysVisible: false,
        noFollow: true,
        alwaysBlank: false,
        plainPaste: false,
        // {cmd: {type: 'x', value: 'y'}}
        icons: {},
        textNearImage: true
     };

    Editable.hexToRGB = function (hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    Editable.hexToRGBString = function (val) {
        var rgb = this.hexToRGB(val);
        return 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
    };
    
    Editable.getIEversion = function () {
        /*global navigator */
        var rv    = -1, ua, re;
        if (navigator.appName == 'Microsoft Internet Explorer')
        {
            ua = navigator.userAgent;
            re = new RegExp("MSIE ([0-9]{1,}[\\.0-9]{0,})");
            if (re.exec(ua) !== null)
                rv = parseFloat( RegExp.$1 );
        }
        else if (navigator.appName == 'Netscape')
        {
            ua = navigator.userAgent;
            re = new RegExp("Trident/.*rv:([0-9]{1,}[\\.0-9]{0,})");
            if (re.exec(ua) !== null)
                rv  = parseFloat( RegExp.$1 );
        }
        return rv;
    };

     Editable.browser = function () {
        var browser = {};
        
        if (Editable.getIEversion() > 0) {
            browser.msie = true;
        }
        else {
             var ua = navigator.userAgent.toLowerCase();

            var match  = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
                /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
                /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
                /(msie) ([\w.]+)/.exec( ua ) ||
                ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
                [];    

            var matched = {
                browser: match[ 1 ] || "",
                version: match[ 2 ] || "0"
            };

            if (match[1]) browser[matched.browser] = true;
            if (parseInt(matched.version, 10) < 9 && browser.msie) browser.oldMsie = true;

            // Chrome is Webkit, but Webkit is also Safari.
            if ( browser.chrome ) {
                browser.webkit = true;
            } else if ( browser.webkit ) {
                browser.safari = true;
            }
        }
        
        return browser;
     };

    /**
     * Get selection text.
     *
     * @returns {string}
     */
    Editable.prototype.text = function () {
        var text = '';
        
        if (window.getSelection) {
            text = window.getSelection();
        } else if (document.getSelection) {
            text = document.getSelection();
        } else if (document.selection) {
            text = document.selection.createRange().text;
        }

         return text.toString();
    };

    /**
     * Determine if selection is inside current editor.
     *
     * @returns {boolean}
     */
    Editable.prototype.selectionInEditor = function () {
        var parent = this.getSelectionParent();
        var inside = false;

        if (parent == this.$element.get(0)) {
            return true;
        }

        $(parent).parents().each($.proxy(function (index, elem) {
            if (elem == this.$element.get(0)) {
                inside = true;
            }
        }, this));

        return inside;
    };

    /**
     * Get current selection.
     *
     * @returns {string}
     */
    Editable.prototype.getSelection = function() {
        var selection = '';
        if (window.getSelection) {
            selection = window.getSelection();
        } else if (document.getSelection) {
            selection = document.getSelection();
        } else {
            selection = document.selection.createRange();
        }

        return selection;
    };

    /**
     * Get current range.
     *
     * @returns {*}
     */
    Editable.prototype.getRange = function () {
        if (window.getSelection)
        {
            var sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                return sel.getRangeAt(0);
            }
        }

        return document.createRange();
    };

    /**
     * Clear selection.
     *
     * @returns {*}
     */
    Editable.prototype.clearSelection = function () {
        // all browsers, except IE before version 9
        if (window.getSelection) {
            var selection = window.getSelection();
            selection.removeAllRanges();
        }

        // Internet Explorer
        else {
            if (document.selection.createRange) {
                document.selection.createRange();
                document.selection.empty();
            }
        }
    };

    /**
     * Get the element where the current selection starts.
     *
     * @returns {*}
     */
    Editable.prototype.getSelectionElement = function () {
        var sel = this.getSelection();

        if (sel.rangeCount) {
            var node = sel.getRangeAt(0).startContainer;
            if (node.nodeType != 1) {
                return node.parentNode;
            }

            return node;
        }

        return this.$element.get(0);
    };

    /**
     * Get the parent of the current selection.
     *
     * @returns {*}
     */
    Editable.prototype.getSelectionParent =  function() {
        var parent = null, sel;

        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.rangeCount) {
                parent = sel.getRangeAt(0).commonAncestorContainer;
                if (parent.nodeType != 1) {
                    parent = parent.parentNode;
                }
            }
        } else if ( (sel = document.selection) && sel.type != "Control") {
            parent = sel.createRange().parentElement();
        }

        return parent;
    };

    /**
     * Check if DOM node is in range.
     *
     * @param range
     * @param node
     * @returns {*}
     */
    Editable.prototype.nodeInRange = function (range, node) {
        var nodeRange;
        if (range.intersectsNode) {
            return range.intersectsNode(node);
        } else {
            nodeRange = node.ownerDocument.createRange();
            try {
                nodeRange.selectNode(node);
            } catch (e) {
                nodeRange.selectNodeContents(node);
            }

            return range.compareBoundaryPoints(Range.END_TO_START, nodeRange) == -1 &&
                range.compareBoundaryPoints(Range.START_TO_END, nodeRange) == 1;
        }
    };


    /**
     * Get the valid element of DOM node.
     *
     * @param node
     * @returns {*}
     */
    Editable.prototype.getElementFromNode = function (node) {
        if (node.nodeType != 1) {
            node = node.parentNode;
        }

        while (node !== null && Editable.VALID_NODES.indexOf(node.tagName) < 0) {
            node = node.parentNode;
        }

        if ($.makeArray($(node).parents()).indexOf(this.$element.get(0)) >= 0) {
            return node;
        }
        else {
            return null;
        }
    };

    Editable.prototype.nextNode = function(node) {
        if (node.hasChildNodes()) {
            return node.firstChild;
        } else {
            while (node && !node.nextSibling) {
                node = node.parentNode;
            }
            if (!node) {
                return null;
            }
            return node.nextSibling;
        }
    };

    Editable.prototype.getRangeSelectedNodes = function(range) {
        var node = range.startContainer;
        var endNode = range.endContainer;

        // Special case for a range that is contained within a single node
        if (node == endNode) {
            return [node];
        }

        // Iterate nodes until we hit the end container
        var rangeNodes = [];
        while (node && node != endNode) {
            rangeNodes.push( node = this.nextNode(node) );
        }

        // Add partially selected nodes at the start of the range
        node = range.startContainer;
        while (node && node != range.commonAncestorContainer) {
            rangeNodes.unshift(node);
            node = node.parentNode;
        }

        return rangeNodes;
    };

    Editable.prototype.getSelectedNodes = function() {
        if (window.getSelection) {
            var sel = window.getSelection();
            if (!sel.isCollapsed) {
                return this.getRangeSelectedNodes(sel.getRangeAt(0));
            }
            else if (this.selectionInEditor()) {
                var container = sel.getRangeAt(0).startContainer;
                if (container.nodeType == 3) 
                    return [container.parentNode];
                else
                    return [container];
            }
        }

        return [];
    };


    /**
     * Get the elements that are selected.
     *
     * @returns {Array}
     */
    Editable.prototype.getSelectionElements = function () {
        var actualNodes = this.getSelectedNodes();
        var nodes = [];

        $.each(actualNodes, $.proxy(function (index, node) {
            if (node !== null) {
                var element = this.getElementFromNode(node);
                if (nodes.indexOf(element) < 0 && element != this.$element.get(0) && element !== null) {
                    nodes.push(element);
                }
            }
        }, this));

        if (nodes.length === 0) {
            nodes.push(this.$element.get(0));
        }

        return nodes;
    };

    /**
     * Get the URL from selection.
     *
     * @returns {string}
     */
    Editable.prototype.getSelectionLink = function () {
        var href, sel;

        if (window.getSelection) {
            sel = window.getSelection();
            href = sel.anchorNode.parentNode.href;
        } else if ( (sel = document.selection) && sel.type != "Control") {
            href = sel.createRange().parentElement().href;
        }

        return href;
    };

    /**
     * Save current selection.
     */
    Editable.prototype.saveSelection = function () {
        var i,
            len,
            ranges,
            sel = this.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            ranges = [];
            for (i = 0, len = sel.rangeCount; i < len; i += 1) {
                ranges.push(sel.getRangeAt(i));
            }
            this.savedRanges = ranges;
        }
        else {
            this.savedRanges = null;
        }
    };

    /**
     * Restore if there is any selection saved.
     */
    Editable.prototype.restoreSelection = function () {
        var i,
            len,
            sel = this.getSelection();
        if (this.savedRanges) {
            sel.removeAllRanges();
            for (i = 0, len = this.savedRanges.length; i < len; i += 1) {
                sel.addRange(this.savedRanges[i]);
            }
        }
    };

    /**
     * Save selection using markers.
     */
    Editable.prototype.saveSelectionByMarkers = function () {
      var range = this.getRange();

      this.placeMarker(range, true); // Start
      this.placeMarker(range, false); // End
    };

    /**
     * Restore selection using markers.
     */
    Editable.prototype.restoreSelectionByMarkers = function () {
      var start_marker = this.$element.find('#marker-true');
      var end_marker = this.$element.find('#marker-false');
      
      if (!start_marker.length || !end_marker.length) return false;
      
      this.$element.removeAttr('contentEditable');
      
      this.$element.focus();

      this.setSelection(start_marker[0], 0, end_marker[0], 0);

      this.removeMarkers();
      
      this.$element.attr('contentEditable', true);
      
      this.$element.focus();
    };

    /**
     * Set selection start.
     *
     * @param sn - Start node.
     * @param so - Start node offset.
     * @param fn - Final node.
     * @param fo - Final node offset.
     */
    Editable.prototype.setSelection = function (sn, so, fn, fo) {
      try {
        if (fn === null) fn = sn;
        if (fo === null) fo = so;

        var sel = this.getSelection();
        if (!sel) return;

        var range = this.getRange();
        range.setStart(sn, so);
        range.setEnd(fn, fo);

        sel.removeAllRanges();
        sel.addRange(range);
      } catch (e) {
      }
    };

    /**
     * Insert marker at start/end of range.
     *
     * @param range
     * @param marker - true/false for begin/end.
     */
    Editable.prototype.placeMarker = function (range, marker) {
      try {
        var boundary = range.cloneRange();

        boundary.collapse(marker);

        boundary.insertNode($('<span id="marker-'+ marker + '">', document)[0]);
        boundary.detach();
      }
      catch (ex) {
        
      }
    };

    /**
     * Remove markers.
     */
    Editable.prototype.removeMarkers = function () {
        this.$element.find('#marker-true, #marker-false').removeAttr('id');
    };
    
    Editable.prototype.getBoundingRect = function () {
      var boundingRect = this.getRange().getBoundingClientRect();
      
      return boundingRect;
    };

    /**
     * Reposition editor using boundingRect.
     */
    Editable.prototype.repositionEditor = function (position) {

        var boundingRect, x, y;

        if (this.options.inlineMode || position) {
            boundingRect = this.getBoundingRect();
                
            if (boundingRect.left > 0 && boundingRect.top > 0 && boundingRect.right > 0 && boundingRect.bottom > 0) {
                x =  boundingRect.left + (boundingRect.width) / 2 + $(window).scrollLeft();
                y = boundingRect.top + boundingRect.height + $(window).scrollTop();
                if (this.isTouch()) {
                    x =  boundingRect.left + (boundingRect.width) / 2;
                    y = boundingRect.top + boundingRect.height;
                }

                this.showByCoordinates(x, y);
            }
            else if (!this.options.alwaysVisible) {
                document.execCommand('selectAll');
                boundingRect = this.getRange().getBoundingClientRect();
                x = boundingRect.left + $(window).scrollLeft();
                y = boundingRect.top + boundingRect.height + $(window).scrollTop();
                if (this.isTouch()) {
                    x = boundingRect.left;
                    y = boundingRect.top + boundingRect.height;
                }
                this.showByCoordinates(x, y - 20);
                this.getRange().collapse(false);
            }
            else {
              this.hide();
            }
        }
    };

    /**
     * Destroy editable object.
     */
    Editable.prototype.destroy = function () {
        this.sync();
        this.$editor.remove();
        if (this.$popup_editor) {
          this.$popup_editor.remove();
        }
        this.$element.replaceWith(this.getHTML());
        this.$box.removeClass('froala-box');
        this.$box.find('.html-switch').remove();
        this.$box.removeData('fa.editable');
        clearTimeout(this.typingTimer);
        clearTimeout(this.ajaxInterval);
        
        // Off element events.
        this.$element.off('mousedown mouseup click keydown keyup keypress touchstart touchend touch drop', '**');
        
        if (this.$upload_frame !== undefined) {
          this.$upload_frame.remove();
        }

        if (this.$textarea) {
            this.$box.remove();
            this.$textarea.removeData('fa.editable');
            this.$textarea.show();
        }
    };

    /**
     * Set callbacks.
     *
     * @param event - Event name
     * @param data - Data to pass to the callback.
     */
    Editable.prototype.callback = function (event, data, sync) {
        var prop = event + 'Callback';

        if (this.options[prop] && $.isFunction(this.options[prop])) {
            if (data) {
                this.options[prop].apply(this, data);
            }
            else {
                this.options[prop].call(this);
            }
        }

        // Will break image resize if does sync.
        if (sync === undefined) {
          this.sync();
        }
    };

    /**
     * Sync between textarea and content.
     */
    Editable.prototype.sync = function () {
      if (this.text() !== '') {
        this.saveSelectionByMarkers();
      }
      
      // HTML5 compliant.
      this.$element.find('b').each (function (index, elem) {
        $(elem).replaceWith('<strong>' + $(elem).html() + '</strong>');
      });
      this.$element.find('i:not(.fa)').each (function (index, elem) {
        $(elem).replaceWith('<em>' + $(elem).html() + '</em>');
      });
      
      // Doesn't work in IE9 and Opera.
      /*this.$element.find('strike').each (function (index, elem) {
        $(elem).replaceWith('<s>' + $(elem).html() + '</s>');
      });*/

      this.restoreSelectionByMarkers();
      
      if (this.$textarea) {
          this.$textarea.val(this.getHTML());
      }

      // Clear empty spans. Probably markers.
      while(this.$element.find('span:empty').length) {
        this.$element.find('span:empty').remove();
      }
      
      // Remove empty elements that may appear.
      this.$element.find('*').each ($.proxy(function (index, elem) {
        if (this.emptyElement(elem) && elem.tagName == 'SPAN') {
          $(elem).remove();
        }
      }, this));
      
      this.disableImageResize();
      
      this.$element.trigger('placeholderCheck');
      
      this.$element.find('a').addClass('f-link');
      
      // Find images with no parent f-img-wrap.
      this.$element.find('img').each(function (index, elem) {
        if ($(elem).parents('.f-img-wrap').length == 0) {
          $(elem).wrap('<span class="f-img-wrap"></span>');
        }
      })
    };
    
    Editable.prototype.emptyElement = function (element) {
      if (element.tagName == 'IMG' || $(element).find('img').length > 0) {
        return false;
      }
      
      var text = $(element).text();
      
      for (var i = 0; i < text.length; i++) {
        if (text[i] !== '\n' && text[i] !== '\r' && text[i] !== '\t') {
          return false;
        }
      }
      
      return true;
    };

    /**
     * Init.$
     *
     * @param element - The element on which to set editor.
     */
    Editable.prototype.init = function (element) {
        this.initElement(element);

        this.initElementStyle();

        this.initUndoRedo();
        
        this.enableTyping();
        
        this.initShortcuts();

        this.initEditor();

        this.initDrag();

        this.initOptions();

        this.initEditorSelection();

        this.initAjaxSaver();

        this.initImageResizer();

        this.initImagePopup();

        this.initLink();
        
        this.setLanguage();

        this.setCustomText();
        
        this.registerPaste();
    };

    Editable.prototype.initLink = function () {
        var that = this;

        // Click on a link.
        this.$element.on('click touchend', 'a', function (e) {
            e.stopPropagation();
            e.preventDefault();

            that.link = true;

            that.clearSelection();
            $(this).prepend('<span id="marker-true"></span>');
            $(this).append('<span id="marker-false"></span>');

            that.restoreSelectionByMarkers();

            that.exec('createLink');

            that.$link_wrapper.find('input[type="text"]').val($(this).attr('href'));
            that.$link_wrapper.find('input[type="checkbox"]').prop('checked', $(this).attr('target') == '_blank');

            // Fix for iPhone 4.
            if (Modernizr.mq('(max-device-width: 320px) and (-webkit-min-device-pixel-ratio: 2)')) {
              that.showByCoordinates($(this).offset().left + $(this).width() / 2, $(this).offset().top + $(this).height());
            }
            else {
               that.repositionEditor(true); 
            }
            that.$popup_editor.show();
            
            // iPad Fix.
            //that.$element.blur();
        });
    };

    Editable.prototype.imageHandle = function () {
        var that = this;

        var $handle = $('<span>').addClass('f-img-handle').on({
            movestart:  function (e) {
                that.hide();
                that.$element.addClass('f-non-selectable').removeAttr('contenteditable');
                that.isResizing = true;

                $(this).attr('data-start-x', e.startX);
                $(this).attr('data-start-y', e.startY);
            },

            move: function (e) {
                var $elem = $(this);
                var diffX = e.pageX - parseInt($elem.attr('data-start-x'), 10);

                $elem.attr('data-start-x', e.pageX);
                $elem.attr('data-start-y',  e.pageY);

                var $img = $elem.prevAll('img');

                if ($elem.hasClass('f-h-ne') || $elem.hasClass('f-h-se')) {
                    $img.width($img.width() + diffX);
                }
                else {
                    $img.width($img.width() - diffX);
                }
            },

            moveend: function () {
                that.isResizing = false;
                $(this).removeAttr('data-start-x');
                $(this).removeAttr('data-start-y');

                that.$element.removeClass('f-non-selectable').attr('contenteditable', true);

                if (that.browser.mozilla) {
                    try {
                        document.execCommand("enableObjectResizing", false, false);
                        document.execCommand('enableInlineTableEditing', false, false);
                    }
                    catch (ex) { }
                }
            }
        });

        return $handle;
    };
    
    Editable.prototype.disableImageResize = function () {
      // Disable resize for FF.
      if (this.browser.mozilla) {
          try {
              document.execCommand("enableObjectResizing", false, false);
              document.execCommand('enableInlineTableEditing', false, false);
          }
          catch (ex) { }
      }
    };

    Editable.prototype.initImageResizer = function () {
      
      this.disableImageResize();

        var that = this;

        this.$element.on('mousedown', 'img', function () {
            if (!that.options.imageMove || that.browser.msie) {
                that.$element.attr('contenteditable', false);
            }
            else {                
              $(this).parents('.f-img-wrap').removeAttr('contenteditable');
                if ($(this).parent().hasClass('f-img-editor')) {
                    that.closeImageMode();
                    that.hide();
                }
            }
        });
        
        this.$element.find('img').each(function (index, elem) {
            elem.oncontrolselect = function () { return false; };
        });

        this.$element.on('mouseup', 'img', function () {
            if (!that.options.imageMove) {
                that.$element.attr('contenteditable', true);
            }
            $(this).parents('.f-img-wrap').attr('contenteditable', 'false');
        });

        // Image click.
        this.$element.on('click touchend', 'img', function (e) {
            e.preventDefault();
            e.stopPropagation();

            // iPad Fix.
            that.$element.blur();

            // Init image editor.
            that.$image_editor.find('button').removeClass('active');
            var float = $(this).css('float');
            that.$image_editor.find('button[data-cmd="floatImage' + float.charAt(0).toUpperCase() + float.slice(1) + '"]').addClass('active');
            that.$image_editor.find('.f-image-alt input[type="text"]').val($(this).attr('alt') || $(this).attr('title'));

            // Hide basic editor.
            that.showImageEditor();

            if (!($(this).parent().hasClass('f-img-editor') && $(this).parent().get(0).tagName == 'SPAN')) {
                $(this).wrap('<span class="f-img-editor" style="float: '+ $(this).css('float') + '; margin-left:' + $(this).css('margin-left') + ' ; margin-right:' + $(this).css('margin-right') + '; margin-bottom: ' + $(this).css('margin-bottom') + '; margin-top: ' + $(this).css('margin-bottom') + ';"></span>');
                $(this).css('margin-left', 'auto');
                $(this).css('margin-right', 'auto');
                $(this).css('margin-bottom', 'auto');
                $(this).css('margin-top', 'auto');
                if ($(this).parents('.f-img-wrap').length == 0) {
                  $(this).parent().wrap('<span class="f-img-wrap"></span>')
                  $(this).parents('.f-img-wrap').attr('contenteditable', false);
                }
            }

            // Get image handle.
            var $handle = that.imageHandle();
            
            // Add Handles.
            $(this).parent().append($handle.clone(true).addClass('f-h-ne'));
            $(this).parent().append($handle.clone(true).addClass('f-h-se'));
            $(this).parent().append($handle.clone(true).addClass('f-h-sw'));
            $(this).parent().append($handle.clone(true).addClass('f-h-nw'));

            // No selection needed. We have image.
            that.clearSelection();
            
            // Reposition editor.
            that.showByCoordinates($(this).offset().left + $(this).width() / 2, $(this).offset().top + $(this).height());

            // Image mode power.
            that.imageMode = true;
        });

        this.$element.find('img').each (function (i, el) {
            el.oncontrolselect = function () { return false; };
        });
    };

    /**
     * Init popup for image.
     */
    Editable.prototype.initImagePopup = function () {
      this.$image_editor = $('<div>').addClass('bttn-wrapper f-image-editor')
      
      for (var i in this.options.imageButtons) {
        var cmd = this.options.imageButtons[i];
        if (Editable.image_commands[cmd] === undefined) {
          continue;
        }
        var button = Editable.image_commands[cmd];
        
        var $btn = $('<button>')
                      .addClass('fr-bttn')
                      .attr('data-cmd', cmd)
                      .attr('title', button.title);
        
        if (this.options.icons[cmd] !== undefined) {
         this.prepareIcon($btn, this.options.icons[cmd]) 
        } 
        else {
          this.prepareIcon($btn, button.icon);
        }
        
        this.$image_editor.append($btn);
      }
        var $insertAlt = $('<div class="f-image-alt">')
                            .append('<label><span data-text="true">Title</span>: </label>')
                            .append($('<input type="text">').on('mouseup touchend keydown', function (e) {e.stopPropagation();} ))
                            .append($('<button class="f-ok" data-text="true">').attr('data-cmd', 'setImageAlt').attr('title', 'OK').html('OK'));
                            
        this.$image_editor.append('<hr/>').append($insertAlt);

        var that = this;

        this.$image_editor.find('button').click (function (e) {
            e.stopPropagation();
            that[$(this).attr('data-cmd')](that.$element.find('span.f-img-editor'));
        });

        this.$popup_editor.append(this.$image_editor);
    };

    Editable.prototype.floatImageLeft = function ($image_editor) {
        $image_editor.css('margin-left', 'auto');
        $image_editor.css('margin-right', this.options.imageMargin);
        $image_editor.css('margin-bottom', this.options.imageMargin);
        $image_editor.css('margin-top', this.options.imageMargin);
        $image_editor.css('float', 'left');
        $image_editor.find('img').css('float', 'left');

        this.saveUndoStep();
        this.callback('floatImageLeft');

        $image_editor.find('img').click();
    };

    Editable.prototype.floatImageNone = function ($image_editor) {
        $image_editor.css('margin-left', 'auto');
        $image_editor.css('margin-right', 'auto');
        $image_editor.css('margin-bottom', this.options.imageMargin);
        $image_editor.css('margin-top', this.options.imageMargin);
        $image_editor.css('float', 'none');
        $image_editor.find('img').css('float', 'none');

        if ($image_editor.parent().get(0) == this.$element.get(0)) {
            $image_editor.wrap('<div style="text-align: center;"></div>');
        }
        else {
            $image_editor.parents('.f-img-wrap:first').css('text-align', 'center');
        }

        this.saveUndoStep();
        this.callback('floatImageNone');

        $image_editor.find('img').click();
    };

    Editable.prototype.floatImageRight = function ($image_editor) {
        $image_editor.css('margin-right', 'auto');
        $image_editor.css('margin-left', this.options.imageMargin);
        $image_editor.css('margin-bottom', this.options.imageMargin);
        $image_editor.css('margin-top', this.options.imageMargin);
        $image_editor.css('float', 'right');
        $image_editor.find('img').css('float', 'right');

        this.saveUndoStep();
        this.callback('floatImageRight');

        $image_editor.find('img').click();
    };

    Editable.prototype.linkImage = function ($image_editor) {
        this.showInsertLink();

        this.imageMode = true;

        if ($image_editor.parent().get(0).tagName == 'A') {
            this.$link_wrapper.find('input[type="text"]').val($image_editor.parent().attr('href'));

            if ($image_editor.parent().attr('target') == '_blank') {
                this.$link_wrapper.find('input[type="checkbox"]').prop('checked', true);
            }
            else {
                this.$link_wrapper.find('input[type="checkbox"]').prop('checked', false);
            }
        }
        else {
            this.$link_wrapper.find('input[type="text"]').val('http://');
            this.$link_wrapper.find('input[type="checkbox"]').prop('checked', this.options.alwaysBlank);
        }
    };

    Editable.prototype.replaceImage = function ($image_editor) {

        this.showInsertImage();
        this.imageMode = true;

        this.$image_wrapper.find('input[type="text"]').val($image_editor.find('img').attr('src'));
    };

    Editable.prototype.removeImage = function ($image_editor) {
      var img = $image_editor.find('img').get(0);
      
      // (img)
      this.callback('beforeRemoveImage', [img]);
      
      var message = 'Are you sure? Image will be deleted.';
      if (Editable.LANGS[this.options.language]) {
        message = Editable.LANGS[this.options.language].translation[message];
      }

      if (confirm(message)) {
          $image_editor.remove();

          this.hide();

          this.saveUndoStep();
          this.callback('afterRemoveImage');
      }
      else {
          $image_editor.find('img').click();
      }
    };

    Editable.prototype.setImageAlt = function ($image_editor) {
        $image_editor.find('img').attr('alt', this.$image_editor.find('.f-image-alt input[type="text"]').val());
        $image_editor.find('img').attr('title', this.$image_editor.find('.f-image-alt input[type="text"]').val());

        this.saveUndoStep();
        this.hide();
        this.closeImageMode();
        this.callback('setImageAlt');
    };

    /**
     * Init element.
     *
     * @param element
     */
    Editable.prototype.initElement = function (element) {
        // Element is <textarea>, convert it to div.
        if (element.tagName == 'TEXTAREA') {
            this.$textarea = $(element);
            
            if (this.$textarea.attr('placeholder') !== undefined && this.options.placeholder == 'Type something') {
              this.options.placeholder = this.$textarea.attr('placeholder');
            }
            
            this.$element = $('<div>').html(this.$textarea.val());
            this.$textarea.before(this.$element).hide();
        }
        else {

            // Remove format block if the element is not a DIV.
            if (element.tagName != 'DIV' && this.options.buttons.indexOf('formatBlock') >= 0) {
                this.disabledList.push('formatBlock');
            }

            this.$element = $(element);
        }

        this.$box = this.$element;
        this.$element = $('<div>');
        this.setHTML(this.$box.html());
        this.$box.empty();
        this.$box.html(this.$element).addClass('froala-box');
        
        this.sync();

        // Drop event.
        this.$element.on('drop', function () {
            setTimeout(function() { $('html').click(); } , 1);
        });
        
        // Enter for PRE and BLOCKQUOTE.
        this.$element.on('keydown', $.proxy(function (e) {
          
          var keyCode = e.which;
          var deniedTags = ['PRE', 'BLOCKQUOTE'];
          if (keyCode == 13 && this.text() == '' && deniedTags.indexOf(this.getSelectionElement().tagName) >= 0 ) {
            e.preventDefault();
            this.insertHTML('<br>');
          }
        }, this));
        
        // Enter for PRE and BLOCKQUOTE.
        this.$element.on('keyup', $.proxy(function (e) {
          this.refreshButtons();
          
          var keyCode = e.which;
          if (keyCode == 13 && this.text() === '' && this.browser.safari) {
            var $element = $(this.getSelectionElement());
            if ($element.parent('li').length) {
              this.saveSelectionByMarkers();
              $element.before('<span id="li-before"></span>')
              $element.after('<span id="li-after"></span>')
              var html = this.$element.html();
              html = html.replace(/<span id=\"li-before\"><\/span>/g, '</li><li>')
              html = html.replace(/<span id=\"li-after\"><\/span>/g, '</li>')
              this.$element.html(html);
              this.restoreSelectionByMarkers();
            }
          }
        }, this));
    };

    Editable.prototype.trim = function (text) {
        return String(text).replace(/^\s+|\s+$/g, '');
    };

    Editable.prototype.wrapText = function () {

        var newWrap = [];
        var INSIDE_TAGS = ['SPAN', 'A', 'B', 'I', 'EM', 'U', 'S', 'STRONG', 'STRIKE', 'FONT'];
        
        var that = this;

        this.$element
            .contents()
            .filter(function() {
                if ((this.nodeType == Node.TEXT_NODE && $(this).text().trim().length > 0) || INSIDE_TAGS.indexOf(this.tagName) >= 0) {
                    newWrap.push(this);
                }
                else {
                    var $div;
                    if (that.options.paragraphy === true) {
                      $div = $('<p>');
                    }
                    else {
                      $div = $('<div>');
                    }
                    for (var i in newWrap) {
                        $div.append($(newWrap[i]).clone());
                        if (i == newWrap.length - 1) {
                            $(newWrap[i]).replaceWith($div);
                        }
                        else {
                            $(newWrap[i]).remove();
                        }
                    }

                    newWrap = [];
                }
            });
        var $div;
        if (this.options.paragraphy === true) {
          $div = $('<p>');
        }
        else {
          $div = $('<div>');
        }
        for (var i in newWrap) {
            $div.append($(newWrap[i]).clone());
            if (i == newWrap.length - 1) {
                $(newWrap[i]).replaceWith($div);
            }
            else {
                $(newWrap[i]).remove();
            }
        }

        this.$element.find('div:empty, > br').remove();
    };

    Editable.prototype.setHTML = function (html) {
      if (!this.options.enableScript) {
        html = this.stripScript(html);
      }
      
      this.$element.html(html);

      this.wrapText();
      
      this.sync();
    };
    
    Editable.prototype.registerPaste = function () {
      var that = this;
      this.$element.get(0).onpaste = function (e) {
        
        if (!that.isHTML) {
          that.callback('beforePaste');
        
          that.pasting = true;
        
          // Save selection
          that.saveSelectionByMarkers();
        
          // Remove and store the editable content
          var frag = that.$element.html();
          that.$element.html('');
        
          window.setTimeout(function() {
          // Get pasted content
          var pastedFrag = that.$element.html();

          // Restore original DOM
          that.$element.html(frag);

          that.restoreSelectionByMarkers();

          if (!that.options.plainPaste) {
            that.insertHTML(that.clean(pastedFrag));
          }
          else {
            that.insertHTML($('<div>').html(pastedFrag).text())
          }

          that.sync();

          that.$element.trigger('placeholderCheck');

          that.pasting = false;

          that.callback('afterPaste')
          }, 1);
        }
      };
    };
    
    Editable.prototype._extractContent = function (node) {
        var frag = document.createDocumentFragment(), child;
        while ( (child = node.firstChild) ) {
            frag.appendChild(child);
        }
        return frag;
    }
    
    /**
     * Clean the html.
    **/
    Editable.prototype.clean = function (htmlToClean, allowID) {
      var allowedAttrs = ['title', 'href', 'alt', 'src'];
      var cleanTags = ['PRE', 'BLOCKQUOTE'];
      
      if (allowID == true) {
        allowedAttrs.push('id')
        allowedAttrs.push('class')
      }
      
      var $html = $('<div>').html(htmlToClean);
      $html.find('*').each(function (index, elem) {
        // Clean eveything inside the specified tags.
        if (cleanTags.indexOf(elem.tagName) >= 0) {
          $(elem).html($(elem).text());
        }
        
        // Remove unwanted attributes.
        $.each(elem.attributes, function() {
          if(this != undefined && allowedAttrs.indexOf(this.name) < 0) {
            $(elem).removeAttr(this.name);
          }
        });
        
        // Remove style attribute.
        $(elem).removeAttr('style')
      })
      
      return this.cleanNewLine($html.html());
    };
    
    Editable.prototype.cleanNewLine = function (html) {
      var r = new RegExp('\\n', 'g') 
      return html.replace(r, '');
    }
    
    Editable.prototype.stripScript = function (html) {
      var div = document.createElement('div');
      div.innerHTML = html;
      var scripts = div.getElementsByTagName('script');
      
      var i = scripts.length;
      while (i--) {
        scripts[i].parentNode.removeChild(scripts[i]);
      }
      
      return div.innerHTML;
    }

    /**
     * Init style for element.
     */
    Editable.prototype.initElementStyle = function () {
        // Enable content editable.
        this.$element.attr('contentEditable', true);
        this.$element.addClass('froala-element').addClass(this.options.editorClass);

        // Remove outline.
        this.$element.css('outline', 0);
    };

    /**
     * Init undo support.
     */
    Editable.prototype.initUndoRedo = function () {
        if (this.isEnabled('undo') || this.isEnabled('redo')) {
            // Undo stack array.
            this.undoStack = [];
            this.undoIndex = 0;
            this.saveUndoStep();
        }

        this.disableBrowserUndo();
    };

    /**
     * Typing is saved in undo stack.
     */
    Editable.prototype.enableTyping = function () {
        this.typingTimer = null;

        this.$element.on('keypress', $.proxy(function () {
            clearTimeout(this.typingTimer);
            this.ajaxSave = false;

            this.oldHtml = this.$element.html();

            this.typingTimer = setTimeout($.proxy(function() {
                if (this.$element.html() != this.oldHtml) {
                  // Add in undo stack.
                  if (this.isEnabled('undo') || this.isEnabled('redo')) {
                    if (this.$element.html() != this.undoStack[this.undoIndex - 1]) {
                      this.saveUndoStep();
                    }
                  }
                     
                  // Do sync. 
                  this.sync();
                }
            }, this), Math.max(this.options.typingTimer, 200));
        }, this));
    };
    
    /**
     * Get HTML from the editor.
     */
    Editable.prototype.getHTML = function () {
      if (this.isHTML) {
        return this.$html_area.val();
      }
      
      var $elem_clone = this.$element.clone();
      $elem_clone.find('.f-img-editor > img').each (function (index, elem) {
          $(elem).css('margin-left', $(elem).parent().css('margin-left'));
          $(elem).css('margin-right', $(elem).parent().css('margin-right'));
          $(elem).css('margin-bottom', $(elem).parent().css('margin-bottom'));
          $(elem).css('margin-top', $(elem).parent().css('margin-top'));
          $(elem).siblings('span.f-img-handle').remove().end().unwrap();
      });
      
      $elem_clone.find('.f-img-wrap').removeAttr('contenteditable');
      
      $elem_clone.find()

      return $elem_clone.html();
    };
    
    Editable.prototype.getText = function () {
      return this.$element.text();
    };
    
    /**
     * Make ajax requests if autosave is enabled.
     */
    Editable.prototype.initAjaxSaver = function () {        
      this.ajaxHTML = this.getHTML();
      this.ajaxSave = true;

      this.ajaxInterval = setInterval($.proxy(function () {
        if (this.ajaxHTML != this.getHTML() && this.ajaxSave) {
          if (this.options.autosave) {
            this.save();
          }
          
          this.ajaxHTML = this.getHTML();
          this.callback('contentChanged', [], false);
        }
        
        this.ajaxSave = true;
      }, this), Math.max(this.options.autosaveInterval, 1000));
    };

    /**
     * Disable browser undo.
     */
    Editable.prototype.disableBrowserUndo = function () {
        $('body').keydown(function (e){
            var keyCode = e.which;
            var ctrlKey = e.ctrlKey || e.metaKey;

            if (!this.isHTML && ctrlKey) {
                if (keyCode == 75) {
                    e.preventDefault();
                    return false;
                }

                if (keyCode == 90 && e.shiftKey) {
                    e.preventDefault();
                    return false;
                }

                if (keyCode == 90) {
                    e.preventDefault();
                    return false;
                }
            }
        });
    };

    /**
     * Save current HTML in undo stack.
     */
    Editable.prototype.saveUndoStep = function () {
        if (this.isEnabled('undo') || this.isEnabled('redo')) {
          while(this.undoStack.length > this.undoIndex) {
            this.undoStack.pop();
          }
          
          if (this.selectionInEditor() && this.$element.is(':focus')) {
            this.saveSelectionByMarkers();
          }
          this.undoStack.push(this.getHTML());
          this.undoIndex++;
          
          this.refreshUndoRedo();
        }

        this.sync();
    };

    /**
     * Enable editor shortcuts.
     */
    Editable.prototype.initShortcuts = function () {
        if (this.options.shortcuts) {
            this.$element.on('keydown', $.proxy(function (e){
                var keyCode = e.which;
                var ctrlKey = e.ctrlKey || e.metaKey;

                if (!this.isHTML && ctrlKey) {
                    // CTRL + f
                    if (keyCode == 70) {
                        // this.repositionEditor()
                        this.show(null);
                        return false;
                    }

                    // CTRL + b
                    if (keyCode == 66) {
                        return this.execDefaultShortcut('bold');
                    }

                    // CTRL + i
                    if (keyCode == 73) {
                        return this.execDefaultShortcut('italic');
                    }

                    // CTRL + u
                    if (keyCode == 85) {
                        return this.execDefaultShortcut('underline');
                    }

                    // CTRL + k
                    if (keyCode == 75) {
                        return this.execDefaultShortcut('createLink');
                    }

                    // CTRL + p
                    if (keyCode == 80) {
                        this.repositionEditor();
                        return this.execDefaultShortcut('insertImage');
                    }

                    // CTRL + a
                    if (keyCode == 65) {
                        return this.execDefaultShortcut('selectAll');
                    }

                    // CTRL + >
                    if (keyCode == 190) {
                        return this.execDefaultShortcut('indent');
                    }

                    // CTRL + <
                    if (keyCode == 188) {
                        return this.execDefaultShortcut('outdent');
                    }

                    // CTRL + h
                    if (keyCode == 72) {
                        return this.execDefaultShortcut('html');
                    }

                    if (keyCode == 48) {
                        return this.execDefaultShortcut('formatBlock', 'n');
                    }

                    if (keyCode == 49) {
                        return this.execDefaultShortcut('formatBlock', 'h1');
                    }

                    if (keyCode == 50) {
                        return this.execDefaultShortcut('formatBlock', 'h2');
                    }

                    if (keyCode == 51) {
                        return this.execDefaultShortcut('formatBlock', 'h3');
                    }

                    if (keyCode == 52) {
                        return this.execDefaultShortcut('formatBlock', 'h4');
                    }

                    if (keyCode == 53) {
                        return this.execDefaultShortcut('formatBlock', 'h5');
                    }

                    if (keyCode == 54) {
                        return this.execDefaultShortcut('formatBlock', 'h6');
                    }

                    // CTRL + SHIFT + z
                    if (keyCode == 90 && e.shiftKey) {
                        this.redo();
                        e.stopPropagation();
                        return false;
                    }

                    // CTRL + z
                    if (keyCode == 90) {
                        this.undo();
                        e.stopPropagation();
                        return false;
                    }
                }

                if (keyCode == 9 && !e.shiftKey) {
                    e.preventDefault();
                    this.insertHTML('&nbsp;&nbsp;&nbsp;&nbsp;', false);
                }
                else if (keyCode == 9 && e.shiftKey) {
                    e.preventDefault();
                }
            }, this));
        }
    };

    Editable.prototype.insertHTML = function (html, selectPastedContent) {
        var sel, range;
        if (window.getSelection) {
            // IE9 and non-IE
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();

                // Range.createContextualFragment() would be useful here but is
                // only relatively recently standardized and is not supported in
                // some browsers (IE9, for one)
                var el = document.createElement("div");
                el.innerHTML = html;
                var frag = document.createDocumentFragment(), node, lastNode;
                while ( (node = el.firstChild) ) {
                    lastNode = frag.appendChild(node);
                }
                var firstNode = frag.firstChild;
                range.insertNode(frag);

                // Preserve the selection
                if (lastNode) {
                    range = range.cloneRange();
                    range.setStartAfter(lastNode);
                    if (selectPastedContent) {
                        range.setStartBefore(firstNode);
                    } else {
                        range.collapse(true);
                    }
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        } else if ( (sel = document.selection) && sel.type != "Control") {
            // IE < 9
            var originalRange = sel.createRange();
            originalRange.collapse(true);
            sel.createRange().pasteHTML(html);
            if (selectPastedContent) {
                range = sel.createRange();
                range.setEndPoint("StartToStart", originalRange);
                range.select();
            }
        }
    };

    /**
     * Run shortcut.
     *
     * @param command - Command name.
     * @param val - Command value.
     * @returns {boolean}
     */
    Editable.prototype.execDefaultShortcut = function (command, val) {
        if (this.isEnabled(command)) {
            this.exec(command, val);
            return false;
        }

        return true;
    };

    /**
     * Init editor.
     */
    Editable.prototype.initEditor = function () {
        this.$editor = $('<div>');
        this.$editor.addClass('froala-editor').hide();
        $('body').append(this.$editor);

        if (this.options.inlineMode) {
            this.initInlineEditor();
        }
        else {
            this.initBasicEditor();
        }
    };

    Editable.prototype.toolbarTop = function () {
        $(window).on('scroll resize', $.proxy(function (){
            if (!this.options.toolbarFixed && !this.options.inlineMode) {
                // && $(window).scrollTop() + this.$editor.height() < this.$box.offset().top + this.$box.height()
                if ($(window).scrollTop() > this.$box.offset().top && $(window).scrollTop() < this.$box.offset().top + this.$box.height()) {
                    this.$editor.addClass('f-scroll');
                    this.$box.css('padding-top', this.$editor.height());
                    this.$editor.css('top', $(window).scrollTop() - this.$box.offset().top);
                }
                else {
                    if ($(window).scrollTop() < this.$box.offset().top) {
                        this.$editor.removeClass('f-scroll');
                        this.$box.css('padding-top', '');
                        this.$editor.css('top', '');
                    }
                }
            }
        }, this));
    };

    /**
     * Basic editor.
     */
    Editable.prototype.initBasicEditor = function () {
        this.$element.addClass('f-basic');

        this.$popup_editor = this.$editor.clone();
        this.$popup_editor.appendTo($('body'));

        this.$editor.addClass('f-basic').show();
        this.$editor.insertBefore(this.$element);

        this.toolbarTop();
    };

    /**
     * Inline editor.
     */
    Editable.prototype.initInlineEditor = function() {
        this.$popup_editor = this.$editor;
    };

    /**
     * Init drag for image insertion.
     */
    Editable.prototype.initDrag = function () {
        // Drag and drop support.
        this.drag_support = {
            filereader: typeof FileReader != 'undefined',
            formdata: !!window.FormData,
            progress: "upload" in new XMLHttpRequest()
        };
    };

    /**
     * Init options.
     */
    Editable.prototype.initOptions = function () {
        this.setDimensions();

        this.setDirection();

        this.setBorderColor();

        this.setPlaceholder();

        this.setPlaceholderEvents();

        this.setSpellcheck();

        this.setButtons();
        
        this.setInverseSkin();
        
        this.setTextNearImage();
    };
    
    Editable.prototype.closeImageMode = function () {      
        this.$element.find('span.f-img-editor > img').each (function (index, elem) {
            $(elem).css('margin-left', $(elem).parent().css('margin-left'));
            $(elem).css('margin-right', $(elem).parent().css('margin-right'));
            $(elem).css('margin-bottom', $(elem).parent().css('margin-bottom'));
            $(elem).css('margin-top', $(elem).parent().css('margin-top'));
            $(elem).siblings('span.f-img-handle').remove().end().unwrap();
        });

        if (this.$element.find('span.f-img-editor').length) {
          this.$element.find('span.f-img-editor').remove();
          this.$element.parents('span.f-img-editor').remove();
        }
        
        this.$element.removeClass('f-non-selectable').attr('contenteditable', true);
        this.$image_editor.hide();
    };

    Editable.prototype.isTouch = function () {
        return Modernizr.touch && window.Touch !== undefined;
    };

    /**
     * Selection events.
     */
    Editable.prototype.initEditorSelection = function () {
        // Hide editor on mouse down.
        this.$element.on('mousedown touchstart', $.proxy(function () {
            if (!this.$element.attr('data-resize')) {
                this.closeImageMode();
                this.hide();
            }
        }, this));

        // Mouse up on element.
        this.$element.on('mouseup touchend', $.proxy(function (e) {
            var text = this.text();

            // There is text selected.
            if ((text !== '' || this.options.alwaysVisible) && !this.isTouch()) {
                e.stopPropagation();
                this.show(e);
            }

            // We are in basic mode. Refresh button state.
            else if (!this.options.inlineMode) {
                this.refreshButtons();
            }

            this.imageMode = false;
        }, this));

        // Image click. stop propagation.
        this.$element.on('mousedown touchstart', 'img, a', $.proxy(function (e) {
            if (!this.isResizing) {
                e.stopPropagation();
            }
        }, this));

        this.$element.on('mousedown touchstart', '.f-img-handle', $.proxy(function () {
            this.$element.attr('data-resize', true);
        }, this));

        this.$element.on('mouseup touchend', '.f-img-handle', $.proxy(function () {
            this.$element.removeAttr('data-resize');
        }, this));
        
        this.$editor.on('mouseup touchend', $.proxy (function (e) {
          e.stopPropagation();
          
          if (this.options.inlineMode === false) {
            this.hide();
          }
        }, this));

        // Mouse up on editor. If we have text or we are in image mode stop it.
        this.$popup_editor.on('mouseup touchend',  $.proxy (function (e) {
            //var text = this.text();

            //if (text !== '' || this.imageMode) {
                e.stopPropagation();
            //}
        }, this));

        if (this.$link_wrapper) {
            this.$link_wrapper.on('mouseup touchend', $.proxy (function (e) {
                e.stopPropagation();
            }));
        }

        if (this.$image_wrapper) {
            this.$image_wrapper.on('mouseup touchend', $.proxy (function (e) {
                e.stopPropagation();
            }));
        }
        
        if (this.$video_wrapper) {
            this.$video_wrapper.on('mouseup touchend', $.proxy (function (e) {
                e.stopPropagation();
            }));
        }

        // Mouse up anywhere else.
        $(window).on('mouseup touchend', $.proxy(function () {
            if (this.selectionInEditor() && this.text() !== '' && !this.isTouch()) {
                this.show(null);
            }
            else {
                this.hide();
                this.closeImageMode();
            }
        }, this));

        // Selection changed. Touch support..
        $(document).on('selectionchange', $.proxy(function (e) {
            if (this.options.inlineMode && this.selectionInEditor() && this.link !== true && this.isTouch()) {

                var text = this.text();

                // There is text selected.
                if (text !== '') {
                  if (!Modernizr.mq('(max-device-width: 320px) and (-webkit-min-device-pixel-ratio: 2)')) {
                    this.show(null);
                  }
                  else {
                    this.hide();
                  }
                  
                  e.stopPropagation();
                }
                else {
                    this.hide();
                }
            }
        }, this));

        // Key down anywhere on window.
        $(window).keydown ($.proxy(function (e) {
            if (!e.ctrlKey) {
                this.hide();
                this.closeImageMode();
            }
        }, this));
    };
    
    /**
     * Set textNearImage.
     *
     * @param text - Placeholder text.
     */
    Editable.prototype.setTextNearImage = function (enable) {

        if (enable !== undefined) {
            this.options.textNearImage = enable;
        }
        
        if (this.options.textNearImage == true) {
          this.$element.removeClass('f-tni');
        }
        else {
          this.$element.addClass('f-tni');
        }
    };

    /**
     * Set placeholder.
     *
     * @param text - Placeholder text.
     */
    Editable.prototype.setPlaceholder = function (text) {

        if (text) {
            this.options.placeholder = text;
        }
        
        if (this.$textarea) {
          this.$textarea.attr('placeholder', this.options.placeholder);
        }

        this.$element.attr('data-placeholder', this.options.placeholder);
    };
    
    Editable.prototype.isEmpty = function () {
      var emptyWebkit = false;
      if (this.browser.webkit) {
        emptyWebkit = this.$element.find('p, div').length == 1 && this.$element.find('p > br, div > br').length == 1;
      }
      
      var text = this.$element.text().replace(/(\r\n|\n|\r|\t)/gm,"");
      return (text === '' || (text.length == 1 && text.charCodeAt(0) == '8203')) && 
      this.$element.find('img').length === 0 && 
      (this.$element.find('p > br, div > br').length === 0 || emptyWebkit) && 
      this.$element.find('li, h1, h2, h3, h4, h5, h6, blockquote, pre').length === 0
    };

    Editable.prototype.setPlaceholderEvents = function () {
      this.$element.on('keyup keydown focus placeholderCheck', $.proxy(function (e) {
        if (this.pasting) {
          return false;
        }
        
        // Empty.
        if (this.isEmpty() && !this.isHTML && e.type !== 'keydown') {
          if (this.options.paragraphy) {
            var $p = $('<p>&#8203;</p>');
          }
          else {
            var $p = $('<div>&#8203;</div>');
          }
          
          this.$element.html($p);
          this.setSelection($p.get(0), 1, null, 1);
          this.$element.addClass('f-placeholder');
        }
        
        // There is a div or a p.
        else if (!this.$element.find('p, div').length) {
          // Wrap text. 
          this.wrapText();
          
          // Place cursor.
          if (this.$element.find('p, div').length) {
            this.setSelection(this.$element.find('p, div')[0], this.$element.find('p, div').text().length, null, this.$element.find('p, div').text().length);
          }
          else {
            this.$element.removeClass('f-placeholder');
          }
        }
        
        // Not empty at all.
        else if (this.isEmpty() === false) {
          this.$element.removeClass('f-placeholder');
        }
      }, this));
      
      this.$element.trigger('placeholderCheck');
    };

    /**
     * Set element dimensions.
     *
     * @param width - Editor width.
     * @param height - Editor height.
     */
    Editable.prototype.setDimensions = function (height, width, minHeight) {

        if (height) {
            this.options.height = height;
        }

        if (width) {
            this.options.width = width;
        }
        
        if (minHeight) {
            this.options.minHeight = minHeight;
        }

        if (this.options.height != 'auto') {
            this.$element.css('height', this.options.height);
        }
        
        if (this.options.minHeight != 'auto') {
            this.$element.css('minHeight', this.options.minHeight);
        }

        if (this.options.width != 'auto') {
            this.$box.css('width', this.options.width);
        }
    };

    /**
     * Set element direction.
     *
     * @param dir - Text direction.
     */
    Editable.prototype.setDirection = function (dir) {
        if (dir) {
            this.options.direction = dir;
        }

        if (this.options.direction != 'ltr' && this.options.direction != 'rtl') {
            this.options.direction = 'ltr';
        }
        
        if (this.options.direction == 'rtl') {
          this.$element.addClass('f-rtl');
          this.$editor.addClass('f-rtl');
          this.$popup_editor.addClass('f-rtl');
        }
        else {
          this.$element.removeClass('f-rtl');
          this.$editor.removeClass('f-rtl');
          this.$popup_editor.removeClass('f-rtl');
        }
    };

    /**
     * Set editor colors.
     *
     * @param color
     */
    Editable.prototype.setBorderColor = function (color) {
        if (color) {
            this.options.borderColor = color;
        }

        var rgb = Editable.hexToRGB(this.options.borderColor);
        if (rgb !== null) {
            this.$editor.css('border-color', this.options.borderColor);
            this.$editor.attr('data-border-color', this.options.borderColor);
            
            if (!this.options.inlineMode) {
              this.$element.css('border-color', this.options.borderColor);
            }
        }
    };

    Editable.prototype.setSpellcheck = function (enable) {
        if (enable !== undefined) {
            this.options.spellcheck = enable;
        }

        this.$element.attr('spellcheck', this.options.spellcheck);
    };
    
    Editable.prototype.setInverseSkin = function (enable) {
        if (enable !== undefined) {
            this.options.inverseSkin = enable;
        }

        if (this.options.inverseSkin) {
          this.$editor.addClass('f-inverse');
          this.$popup_editor.addClass('f-inverse');
        }
        else {
          this.$editor.removeClass('f-inverse');
          this.$popup_editor.removeClass('f-inverse');
        }
    };
    
    Editable.prototype.customizeText = function (customText) {
      if (customText) {
          this.$editor.find('[title]').add(this.$popup_editor.find('[title]'))
            .each($.proxy(function(index, elem) {
                for (var old_text in customText) {
                    if ($(elem).attr('title').toLowerCase() == old_text.toLowerCase()) {
                        $(elem).attr('title', customText[old_text]);
                    }
                }
            }, this));

          this.$editor.find('[data-text="true"]').add(this.$popup_editor.find('[data-text="true"]'))
            .each($.proxy(function (index, elem) {
                for (var old_text in customText) {
                    if ($(elem).text().toLowerCase() == old_text.toLowerCase()) {
                        $(elem).text(customText[old_text]);
                    }
                }
            }, this));
        }
    };
    
    Editable.prototype.setLanguage = function (lang) {
      if (lang !== undefined) {
        this.options.language = lang;
      }
      
      if ($.Editable.LANGS[this.options.language]) {
        this.customizeText($.Editable.LANGS[this.options.language].translation);
        if ($.Editable.LANGS[this.options.language].direction) {
          this.setDirection($.Editable.LANGS[this.options.language].direction);
        }
        
        if ($.Editable.LANGS[this.options.language].translation[this.options.placeholder]) {
          this.setPlaceholder($.Editable.LANGS[this.options.language].translation[this.options.placeholder]);
        }
      }
    };

    Editable.prototype.setCustomText = function (customText) {
        if (customText) {
          this.options.customText = customText;
        }

        if (this.options.customText) {
          this.customizeText(this.options.customText);
        }
    };
    
    Editable.prototype.execHTML = function () {
        this.html();
    };
    
    Editable.prototype.initHTMLArea = function () {
        this.$html_area = $('<textarea wrap="hard">').keydown(function (e) {
            var keyCode = e.keyCode || e.which;

            if (keyCode == 9) {
              e.preventDefault();
              var start = $(this).get(0).selectionStart;
              var end = $(this).get(0).selectionEnd;

              // set textarea value to: text before caret + tab + text after caret
              $(this).val($(this).val().substring(0, start) + "\t" + $(this).val().substring(end));

              // put caret at right position again
              $(this).get(0).selectionStart = $(this).get(0).selectionEnd = start + 1;
            }
        });
    };

    /**
     * Set buttons for editor.
     *
     * @param buttons
     */
    Editable.prototype.setButtons = function (buttons) {

        if (buttons) {
            this.options.buttons = buttons;
        }

        this.$bttn_wrapper = $('<div>').addClass('bttn-wrapper');
        this.$editor.append(this.$bttn_wrapper);

        // Add commands to editor.
        for ( var i in this.options.buttons ) {
          
            var $dropdown, $btn; 
          
            if (this.options.buttons[i] == 'sep') {
                if (this.options.inlineMode) {
                    this.$bttn_wrapper.append('<div class="f-clear"></div><hr/>');
                }
                else {
                    this.$bttn_wrapper.append('<span class="f-sep"></span>');
                }
            }

            var command = Editable.commands[this.options.buttons[i]];
            if (command === undefined) {
                command = this.options.customButtons[this.options.buttons[i]];
                
                if (command === undefined) {
                  continue;
                }
                else {
                  $btn = this.buildCustomButton(command);
                  this.$bttn_wrapper.append($btn);
                  continue;
                }
            }

            command.cmd = this.options.buttons[i];

            switch(command.cmd) {
                case 'color':
                    $dropdown = this.buildDropdownColor(command);
                    $btn = this.buildDropdownButton(command, 'fr-color-picker').append($dropdown);
                    this.$bttn_wrapper.append($btn);
                    break;

                case 'align':
                    $dropdown = this.buildDropdownAlign(command);
                    $btn = this.buildDropdownButton(command, 'fr-selector').append($dropdown);
                    this.$bttn_wrapper.append($btn);
                    break;

                case 'fontSize':
                    $dropdown = this.buildDropdownFontsize(command);
                    $btn = this.buildDropdownButton(command).append($dropdown);
                    this.$bttn_wrapper.append($btn);
                    break;

                case 'formatBlock':
                    $dropdown = this.buildDropdownFormatblock(command);
                    $btn = this.buildDropdownButton(command).append($dropdown);
                    this.$bttn_wrapper.append($btn);
                    break;

                case 'createLink':
                    $btn = this.buildDefaultButton(command);
                    this.$bttn_wrapper.append($btn);
                    break;

                case 'insertImage':
                    $btn = this.buildDefaultButton(command);
                    this.$bttn_wrapper.append($btn);
                    break;
                    
                case 'insertVideo':
                  $btn = this.buildDefaultButton(command);
                  this.$bttn_wrapper.append($btn);
                  this.buildInsertVideo();
                  break;

                case 'undo': case 'redo':
                    $btn = this.buildDefaultButton(command);
                    this.$bttn_wrapper.append($btn);
                    $btn.prop('disabled', true);
                break;

                case 'html':
                  $btn = this.buildDefaultButton(command);
                  this.$bttn_wrapper.append($btn);

                  if (this.options.inlineMode) {
                      this.$box.append($btn.clone(true).addClass('html-switch').attr('title', 'Hide HTML').click($.proxy(this.execHTML, this)));
                  }
                  
                  this.initHTMLArea();
                break;

                default:
                    $btn = this.buildDefaultButton(command);
                    this.$bttn_wrapper.append($btn);
            }
        }

        this.buildCreateLink();
        this.buildInsertImage();

        this.bindButtonEvents();
    };
    
    /**
     * Create button for command.
     *
     * @param command - Command name.
     * @returns {*}
     */
    Editable.prototype.buildDefaultButton = function (command) {
        var $btn = $('<button>')
            .addClass('fr-bttn')
            .attr('title', command.title)
            .attr('data-cmd', command.cmd)
            .attr('data-activeless', command.activeless);
          
        if (this.options.icons[command.cmd] !== undefined) {
          this.prepareIcon($btn, this.options.icons[command.cmd])
        }
        else {
          this.addButtonIcon($btn, command);
        }

        return $btn;
    };
    
    Editable.prototype.prepareIcon = function ($btn, icon) {
      if (icon.type == 'font') {
        this.addButtonIcon($btn, {icon: icon.value});
      }
      else if (icon.type == 'img') {
        this.addButtonIcon($btn, {icon_img: icon.value, title: $btn.attr('title')});
      }
      else if (icon.type == 'txt') {
        this.addButtonIcon($btn, {icon_txt: icon.value});
      }
    }


    /**
     * Add icon to button.
     *
     * @param $btn - jQuery object.
     * @param command - Command name.
     */
    Editable.prototype.addButtonIcon = function ($btn, command) {
        if (command.icon) {
            $btn.append($('<i>').addClass(command.icon));
        }
        else if (command.icon_alt) {
            $btn.append(
                $('<i>')
                    .addClass('for-text')
                    .html(command.icon_alt)
            );
        }
        else if (command.icon_img) {
          $btn.append($('<img src="'+ command.icon_img + '">').attr('alt', command.title));
        }
        else if (command.icon_txt) {
          $btn.append(
              $('<i>')
                  .html(command.icon_txt)
          );
        }
        else {
            $btn.append(command.title);
        }
    };
    
    Editable.prototype.buildCustomButton = function (button) {
      var $btn = $('<button>')
          .addClass('fr-bttn')
          .attr('title', button.title);
          
      this.prepareIcon($btn, button.icon);
      
      $btn.on('click touchend', $.proxy(function (e) {
        e.stopPropagation();
        e.preventDefault();
        
        button.callback(this);
      }, this));
          
      return $btn;
    };

    /**
     * Default dropdown.
     *
     * @param command - Command.
     * @param cls - Dropdown custom class.
     * @returns {*}
     */
    Editable.prototype.buildDropdownButton = function (command, cls) {
        cls = cls || '';

        // Dropdown button.
        var $btn_wrapper = $('<div>')
            .addClass('fr-bttn fr-dropdown')
            .addClass(cls);

        var $btn = $('<button>')
            .addClass('fr-trigger')
            .attr('title', command.title);

        this.addButtonIcon($btn, command);

        $btn_wrapper.append($btn);

        return $btn_wrapper;
    };

    /**
     * Dropdown for color.
     *
     * @param command
     * @returns {*}
     */
    Editable.prototype.buildDropdownColor = function (command) {
        var $dropdown = $('<div>').addClass('fr-dropdown-menu');

        // Iterate color seed.
        for (var j in command.seed) {
            var color_set = command.seed[j];

            // Color headline.
            var $color_el = $('<div>').append($('<p data-text="true">').html(color_set.title));

            // Iterate color blocks.
            for (var k in color_set.value) {

                // Color block.
                var $color = color_set.value[k];
                $color_el
                    .append(
                        $('<button>')
                            .addClass('fr-color-bttn')
                            .attr('data-cmd', color_set.cmd)
                            .attr('data-val', $color)
                            .attr('data-activeless', command.activeless)
                            .css('background-color', $color).html('&nbsp;'));

                // New line.
                if (k % 8 == 7 && k > 0) {
                    $color_el.append('<hr/>');

                    // Higher new line.
                    if (k == 7 || k == 15) {
                        $color_el.append($('<div>').addClass('separator'));
                    }
                }
            }

            // Append color element to dropdown.
            $dropdown.append($color_el);
        }

        return $dropdown;
    };

    /**
     * Dropdown for align.
     *
     * @param command
     * @returns {*}
     */
    Editable.prototype.buildDropdownAlign = function (command) {
        var $dropdown = $('<ul>').addClass('fr-dropdown-menu');

        // Iterate color seed.
        for (var j in command.seed) {
            var align = command.seed[j];

            var $align_bttn = $('<li>')
                .append(
                    $('<button>')
                        .addClass('fr-bttn')
                        .attr('data-cmd', align.cmd)
                        .attr('title', align.title)
                        .attr('data-activeless', command.activeless)
                        .append($('<i>').addClass(align.icon))
                );

            $dropdown.append($align_bttn);
        }

        return $dropdown;
    };

    /**
     * Dropdown for fontSize.
     *
     * @param command
     * @returns {*}
     */
    Editable.prototype.buildDropdownFontsize = function (command) {
        var $dropdown = $('<ul>').addClass('fr-dropdown-menu f-font-sizes');

        // Iterate color seed.
        for (var j in command.seed) {
            var font = command.seed[j];

            for (var k = font.min; k <= font.max; k++) {
                var $font_bttn = $('<li>')
                    .attr('data-cmd', command.cmd)
                    .attr('data-val', k + 'px')
                    .attr('data-activeless', command.activeless)
                    .append(
                        $('<a href="#">')
                            .append(
                                $('<span>')
                                    .text(k + 'px')
                            )
                    );

                $dropdown.append($font_bttn);
            }
        }

        return $dropdown;
    };

    /**
     * Dropdown for formatBlock.
     *
     * @param command
     * @returns {*}
     */
    Editable.prototype.buildDropdownFormatblock = function (command) {
        var $dropdown = $('<ul>').addClass('fr-dropdown-menu');

        // Iterate format block seed.
        for (var j in command.seed) {
            var cmd = command.seed[j];

            if ($.inArray(cmd.value, this.options.blockTags) == -1 ) {
                continue;
            }

            var $format_btn = $('<li>')
                .append(
                    $('<li>')
                        .attr('data-cmd', command.cmd)
                        .attr('data-val', cmd.value)
                        .attr('data-activeless', command.activeless)
                        .append(
                            $('<a href="#" data-text="true">')
                                .addClass('format_' + cmd.value)
                                .attr('title', cmd.title)
                                .text(cmd.title)
                        )
                );

            $dropdown.append($format_btn);
        }

        return $dropdown;
    };

    /**
     * Build insert image.
     */
    Editable.prototype.buildInsertImage = function () {
        this.$image_wrapper = $('<div>').addClass('image-wrapper');
        this.$popup_editor.append(this.$image_wrapper);

        var that = this;

        this.$progress_bar = $('<p class="f-progress">').append('<span></span>');

        var $drag_n_drop = $('<div class="f-upload">')
            .append('<strong data-text="true">Drop Image</strong><br>(<span data-text="true">or click</span>)')
            .append(
                $('<form method="post" action="' + this.options.imageUploadURL + '" enctype="multipart/form-data" target="frame-' + this._id + '">')
                    .append(
                        $('<input type="file" name="' + this.options.imageUploadParam + '" />')
                    )
            );
        
        // Build upload frame.
        if (this.browser.msie) {
          this.$upload_frame = $('<iframe id="frame-' + this._id + '" name="frame-' + that._id + '" src="javascript:false;" style="width:0; height:0; border:0px solid #FFF;">');
          $('body').append(this.$upload_frame);
          this.$upload_frame.bind('load', function () {
            var response = $(this).contents().text();
            that.parseImageResponse(response);
          });
        }
        
        // File was picked.    
        this.$image_wrapper.on('change', 'input[type="file"]', function () {
          if (this.files !== undefined) {
            that.uploadFile(this.files);
          }
          else {
            var $form = $(this).parents('form');
            $form.find('input[type="hidden"]').remove();
            for (var key in that.options.imageParams) {
              $form.append('<input type="hidden" name="' + key + '" value="' + that.options.imageParams[key] + '" />');
            }
            $form.append('<input type="hidden" name="XHR_CORS_TRARGETORIGIN" value="' + window.location.href + '" />');
           // $form.attr('action', that.options.imageUploadURL);
            $form.submit();
          }
        });

        this.buildDragUpload($drag_n_drop);

        var $url = $('<input type="text" placeholder="http://example.com"/>')
            .on('mouseup touchend keydown', $.proxy(function (e){
                e.stopPropagation();
            }, this));

        this.$image_list = $('<ul>')
            .append(
                $('<li class="drop-upload">')
                    .append($drag_n_drop)
            )
            .append(
                $('<li class="url-upload">')
                    .append('<label><span data-text="true">Enter URL</span>: </label>')
                    .append($url)
                    .append(
                        $('<button class="f-ok" data-text="true">OK</button>')
                            .click($.proxy(function () {
                                this.writeImage($url.val());
                            }, this))
                    )
            );

        this.$image_wrapper
            .append(
                $('<h4>')
                    .append('<span data-text="true">Insert image</span>')
                    .append(
                        $('<i class="fa fa-times" title="Cancel">')
                            .click($.proxy(function (){
                                this.$bttn_wrapper.show();
                                this.hideImageWrapper(true);

                                this.restoreSelection();

                                if (!this.options.inlineMode && !this.imageMode) {
                                    this.hide();
                                }
                                else if (this.imageMode) {
                                    this.showImageEditor();
                                }
                            }, this))
                    )
            )
            .append(this.$image_list)
            .append(this.$progress_bar)
            .click(function (e) {
                e.stopPropagation();
            })
            .find('*').click(function (e) {
                e.stopPropagation();
            })
            .end().hide();
    };
    
    Editable.prototype.buildInsertVideo = function () {
      this.$video_wrapper = $('<div>').addClass('video-wrapper');
      this.$popup_editor.append(this.$video_wrapper);

      var $textarea = $('<textarea placeholder="Embeded code">')
          .on('mouseup touchend keydown', $.proxy(function (e){
              e.stopPropagation();
          }, this));

      var $buttons = $('<p>')
          .append(
              $('<button class="f-ok" data-text="true">OK</button>')
                  .click($.proxy(function () {
                    this.restoreSelection();
                    if (this.options.paragraphy) {
                      $(this.getSelectionElements()[0]).after('<p style="text-align: center;">' + $textarea.val() + '</p>');
                    }
                    else {
                      $(this.getSelectionElements()[0]).after('<div style="text-align: center;">' + $textarea.val() + '</div>');
                    }
                    this.saveUndoStep();
                    this.$bttn_wrapper.show();
                    this.hideVideoWrapper();
                    this.hide();
                    
                    // call with (video)
                    this.callback('insertVideo', [$textarea.val()]);
                  }, this))
          );

      this.$video_wrapper
          .append(
              $('<h4>')
                  .append('<span data-text="true">Insert video</span>')
                  .append(
                      $('<i class="fa fa-times" title="Cancel">')
                          .click($.proxy(function (){
                              this.$bttn_wrapper.show();
                              this.hideVideoWrapper();

                              this.restoreSelection();

                              if (!this.options.inlineMode) {
                                  this.hide();
                              }
                          }, this))
                  )
          )
          .append($textarea)
          .append($buttons)
          .click(function (e) {
              e.stopPropagation();
          })
          .find('*').click(function (e) {
              e.stopPropagation();
          })
          .end().hide();
    };

    /**
     * Build create link.
     */
    Editable.prototype.buildCreateLink = function () {
        this.$link_wrapper = $('<div>').addClass('link-wrapper');
        this.$popup_editor.append(this.$link_wrapper);

        var $url = $('<input type="text">')
            .attr('placeholder', "http://www.example.com")
            .on('mouseup touchend keydown', function (e) {
                e.stopPropagation();
            });

        var $blank_url = $('<input type="checkbox" id="f-checkbox-' + this._id + '">').click(function(e){
            e.stopPropagation();
        });

        var $ok_btn = $('<button class="f-ok" type="button" data-text="true">').text('OK')
            .on('touchend', function (e) {
                e.stopPropagation();
            })
            .click($.proxy(function () {
                this.writeLink($url.val(), $blank_url.prop('checked'));
            },this));

        var $unlink_btn = $('<button class="f-ok f-unlink" data-text="true" type="button">').text('UNLINK')
            .on('click touch', $.proxy(function () {
                this.link = true;
                this.writeLink('', $blank_url.prop('checked'));
            },this));

        this.$link_wrapper
            .append(
                $('<h4>')
                    .append('<span data-text="true">Insert link</span>')
                    .append(
                        $('<i class="fa fa-times" title="Cancel">')
                            .click($.proxy(function (){
                                this.$bttn_wrapper.show();
                                this.hideLinkWrapper();

                                if (!this.options.inlineMode && !this.imageMode) {
                                    this.hide();
                                }
                                else if (this.imageMode) {
                                    this.showImageEditor();
                                }

                                this.restoreSelection();
                            }, this))
                    )
            )
            .append($url)
            .append(
                $('<p>')
                    .append($blank_url)
                    .append(' <label for="f-checkbox-' + this._id + '" data-text="true">Open in new tab</label>')
                    .append($ok_btn)
                    .append($unlink_btn)
            )
            .end().hide();
    };

    /**
     * Add drag and drop upload.
     *
     * @param $holder - jQuery object.
     */
    Editable.prototype.buildDragUpload = function ($holder) {
        var that = this;

        $holder.on({
            dragover: function () {
                $(this).addClass('f-hover');
                return false;
            },

            dragend: function () {
                $(this).removeClass('f-hover');
                return false;
            },

            drop: function (e) {
                $(this).removeClass('f-hover');
                e.preventDefault();

                that.uploadFile(e.originalEvent.dataTransfer.files);
            }
        });
    };
    
    Editable.prototype.hideImageLoader = function () {
        this.$progress_bar.hide();
        this.$progress_bar.find('span').css('width', '0%').text('');
        this.$image_list.show();
    };

    /**
     * Insert image command.
     *
     * @param image_link
     */
    Editable.prototype.writeImage = function (image_link) {
        var img = new Image();
        img.onerror = $.proxy(function () {
            this.hideImageLoader();
            this.throwImageError(1);
        }, this);
        
        if (this.imageMode) {
            img.onload = $.proxy(function() {
                this.$element.find('.f-img-editor > img').attr('src', image_link);

                this.hide();
                this.hideImageLoader();
                this.$image_editor.show();

                this.saveUndoStep();
                // call with (imageURL)
                this.callback('replaceImage', [image_link]);
            }, this);

            img.src = image_link;

            return false;
        } 
            
        img.onload = $.proxy(function() {
          this.$element.focus()
          
          var img_s = '<img alt="Image title" src="' + image_link + '" width="200" style="min-width: 16px; min-height: 16px; margin-bottom: ' + this.options.imageMargin + 'px; margin-left: auto; margin-right: auto; margin-top: ' + this.options.imageMargin + 'px">';
          this.insertHTML(img_s)
          this.$element.find('img').each (function (index, elem) {
            elem.oncontrolselect = function () { return false; };
          })

          this.hide();
          this.hideImageLoader();

          this.saveUndoStep();
          // (imageURL)
          this.callback('insertImage', [image_link]);
        }, this);

        img.src = image_link;
    };

    Editable.prototype.throwImageError = function (code) {
        var status = 'Unknown image upload error.';
        if (code == 1) {
            status = 'Bad link.';
        }
        else if (code == 2) {
            status = 'No link in upload response.';
        }
        else if (code == 3) {
            status = 'Error during file upload.';
        }
        else if (code == 4) {
            status = 'Parsing response failed.';
        }
        
        if (this.options.imageErrorCallback && $.isFunction(this.options.imageErrorCallback)) {
            this.options.imageErrorCallback({errorCode: code, errorStatus: status});              
        }
        
        this.hideImageLoader();
    };

    /**
     * Upload files to server.
     *
     * @param files
     */
    Editable.prototype.uploadFile = function (files) {
        if (files !== undefined && files.length > 0) {
          var formData;
          
          if (this.drag_support.formdata) {
            formData = this.drag_support.formdata ? new FormData() : null;
          }
          
          if (formData) formData.append(this.options.imageUploadParam, files[0]);

          if (formData) {
              var xhr;
              if (this.options.crossDomain) {
                  xhr = this.createCORSRequest('POST', this.options.imageUploadURL);
              }
              else {
                  xhr = new XMLHttpRequest();
                  xhr.open('POST', this.options.imageUploadURL);
              }            

              xhr.onload = $.proxy(function() {
                  this.$progress_bar.find('span').css('width', '100%').text('Please wait!');
                  try {
                      if (xhr.status == 200) {
                        this.parseImageResponse(xhr.responseText);
                      }
                      else {
                        this.throwImageError(3);
                      }
                  }
                  catch(ex) {
                      // Bad response.
                      this.throwImageError(4);
                  }
              }, this);

              xhr.onerror = $.proxy(function()
              {
                  // Error on uploading file.
                  this.throwImageError(3);

              }, this);

              xhr.upload.onprogress = $.proxy(function (event) {
                  if (event.lengthComputable) {
                      var complete = (event.loaded / event.total * 100 | 0);
                      this.$progress_bar.find('span').css('width', complete + '%');
                  }
              }, this);

              for (var key in this.options.imageParams) {
                formData.append(key, this.options.imageParams[key]);
              }
            
              xhr.send(formData);
            
              this.$image_list.hide();
              this.$progress_bar.show();
          }
        }
    };
    
    Editable.prototype.parseImageResponse = function (response) {
      try {
        var resp = $.parseJSON(response);

        if (resp.link) {
            this.writeImage(resp.link);
        }
        else {
            // No link in upload request.
            this.throwImageError(2);
        }
      }
      catch (ex) {
        // Bad response.
        this.throwImageError(4);
      }
    };

    /**
     * Make request with CORS.
     *
     * @param method
     * @param url
     * @returns {XMLHttpRequest}
     */
    Editable.prototype.createCORSRequest = function(method, url) {
        var xhr = new XMLHttpRequest();
        if ("withCredentials" in xhr) {

            // Check if the XMLHttpRequest object has a "withCredentials" property.
            // "withCredentials" only exists on XMLHTTPRequest2 objects.
            xhr.open(method, url, true);

        } else if (typeof XDomainRequest != "undefined") {

            // Otherwise, check if XDomainRequest.
            // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
            xhr = new XDomainRequest();
            xhr.open(method, url);

        } else {
            // Otherwise, CORS is not supported by the browser.
            xhr = null;

        }
        return xhr;
    };

    /**
     * Write link in document.
     *
     * @param url - Link URL.
     * @param blank - New tab.
     */
    Editable.prototype.writeLink = function (url, blank, nofollow) {
      if (this.options.noFollow) {
        nofollow = true;
      }
      
      if (this.options.alwaysBlank) {
        blank = true;
      }
      
      var nofollow_string = '', blank_string = '';
      if (nofollow === true) {
        nofollow_string = 'rel="nofollow"';
      }
      
      if (blank === true) {
        blank_string = 'target="_blank"';
      }

        if (this.imageMode) {
            if (url !== '') {
                if (this.$element.find('.f-img-editor').parent().get(0).tagName != 'A') {
                  this.$element.find('.f-img-editor').wrap('<a class="f-link" href="' + url + '" ' + blank_string + ' ' + nofollow_string + '></a>');
                }
                else {
                    if (blank === true) {
                        this.$element.find('.f-img-editor').parent().attr('target', '_blank');
                    }
                    else {
                        this.$element.find('.f-img-editor').parent().removeAttr('target');
                    }
                    
                    if (nofollow === true) {
                      this.$element.find('.f-img-editor').parent().attr('rel', 'nofollow');
                    }
                    else {
                      this.$element.find('.f-img-editor').parent().removeAttr('rel');
                    }
                    
                    this.$element.find('.f-img-editor').parent().attr('href', url);
                }
                
                // (URL)
                this.callback('insertImageLink', [url]);
            }
            else {
                if (this.$element.find('.f-img-editor').parent().get(0).tagName == 'A') {
                    $(this.$element.find('.f-img-editor').get(0)).unwrap();
                }

                this.callback('removeImageLink');
            }

            this.saveUndoStep();
            this.showImageEditor();
            this.$element.find('.f-img-editor').find('img').click();

            this.link = false;
            return false;
        }

        this.restoreSelection();
        document.execCommand('unlink', false, url);
        this.saveSelectionByMarkers();
        this.$element.find('span.f-link').each (function (index, elem) {
            $(elem).replaceWith($(elem).html());
        });
        this.restoreSelectionByMarkers();

        if (url !== '') {
            document.execCommand('createLink', false, url);

            var links = this.getSelectionLinks();
            for (var i = 0; i < links.length; i++) {
                if (blank === true) {
                    $(links[i]).attr('target', '_blank');
                }
                
                if (nofollow === true) {
                    $(links[i]).attr('rel', 'nofollow');
                }
                
                $(links[i]).addClass('f-link');
            }

            this.$element.find('a:empty').remove();
            // URL
            this.callback('insertLink', [url]);
        }
        else {
            this.$element.find('a:empty').remove();
            this.callback('removeLink');
        }

        this.saveUndoStep();

        this.hideLinkWrapper();
        this.$bttn_wrapper.show();

        if (!this.options.inlineMode) {
            this.hide();
        }

        this.link = false;
    };

    /**
     * Get links from selection.
     *
     * @returns {Array}
     */
    Editable.prototype.getSelectionLinks = function () {
        var selectedLinks = [];
        var range, containerEl, links, linkRange;
        if (window.getSelection) {
            var sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                linkRange = document.createRange();
                for (var r = 0; r < sel.rangeCount; ++r) {
                    range = sel.getRangeAt(r);
                    containerEl = range.commonAncestorContainer;
                    if (containerEl.nodeType != 1) {
                        containerEl = containerEl.parentNode;
                    }
                    if (containerEl.nodeName.toLowerCase() == "a") {
                        selectedLinks.push(containerEl);
                    } else {
                        links = containerEl.getElementsByTagName("a");
                        for (var i = 0; i < links.length; ++i) {
                            linkRange.selectNodeContents(links[i]);
                            if (linkRange.compareBoundaryPoints(range.END_TO_START, range) < 1 && linkRange.compareBoundaryPoints(range.START_TO_END, range) > -1) {
                                selectedLinks.push(links[i]);
                            }
                        }
                    }
                }
                linkRange.detach();
            }
        } else if (document.selection && document.selection.type != "Control") {
            range = document.selection.createRange();
            containerEl = range.parentElement();
            if (containerEl.nodeName.toLowerCase() == "a") {
                selectedLinks.push(containerEl);
            } else {
                links = containerEl.getElementsByTagName("a");
                linkRange = document.body.createTextRange();
                for (var j = 0; j < links.length; ++j) {
                    linkRange.moveToElementText(links[j]);
                    if (linkRange.compareEndPoints("StartToEnd", range) > -1 && linkRange.compareEndPoints("EndToStart", range) < 1) {
                        selectedLinks.push(links[j]);
                    }
                }
            }
        }
        return selectedLinks;
    };

    /**
     * Check if command is enabled.
     *
     * @param cmd - Command name.
     * @returns {boolean}
     */
    Editable.prototype.isEnabled = function (cmd) {
        return $.inArray(cmd, this.options.buttons) >= 0;
    };

    Editable.prototype.show = function (e) {

        if (e === undefined) return;

        if (this.options.inlineMode) {
            if (e !== null && e.type !== 'touchend') {
                var x = e.pageX;
                var y = e.pageY;

                if (x < 20) x = 20;
                if (y < 0) y = 0;

                if (x + this.$editor.width() > $(window).width() - 50) {
                    this.$editor.addClass('right-side');
                    x =  $(window).width() - (x + 30);
                    this.$editor.css('top', y + 20);
                    this.$editor.css('right', x);
                    this.$editor.css('left', 'auto');
                }
                else {
                    this.$editor.removeClass('right-side');
                    this.$editor.css('top', y + 20);
                    this.$editor.css('left', x - 20);
                    this.$editor.css('right', 'auto');
                }

                $('.froala-editor:not(.f-basic)').hide();
                this.$editor.show();
            }
            else {
                $('.froala-editor:not(.f-basic)').hide();
                this.$editor.show();
                this.repositionEditor();
            }
        }

        this.hideLinkWrapper();
        this.hideVideoWrapper();
        this.hideImageWrapper();

        this.$bttn_wrapper.show();
        this.$bttn_wrapper.find('.fr-dropdown').removeClass('active');
        this.refreshButtons();

        this.imageMode = false;
    };

    Editable.prototype.showByCoordinates = function (x, y) {
        x = x - 20;
        y = y + 15;

        if (x + this.$popup_editor.width() > $(window).width() - 50) {
            this.$popup_editor.addClass('right-side');
            x =  $(window).width() - (x + 40);
            this.$popup_editor.css('top', y);
            this.$popup_editor.css('right', x);
            this.$popup_editor.css('left', 'auto');
        }
        else {
            this.$popup_editor.removeClass('right-side');
            this.$popup_editor.css('top', y);
            this.$popup_editor.css('left', x);
            this.$popup_editor.css('right', 'auto');
        }

        this.$popup_editor.show();
    };

    Editable.prototype.showLinkWrapper = function () {
        if (this.$link_wrapper) {
            this.$link_wrapper.show();
        }
    };

    Editable.prototype.hideLinkWrapper = function () {
        if (this.$link_wrapper) {
            this.$link_wrapper.hide();
        }
    };

    Editable.prototype.showImageWrapper = function () {
        if (this.$image_wrapper) {
            this.$image_wrapper.show();
        }
    };
    
    Editable.prototype.showVideoWrapper = function () {
        if (this.$video_wrapper) {
            this.$video_wrapper.show();
        }
    };

    Editable.prototype.hideImageWrapper = function (image_mode) {
        if (this.$image_wrapper) {
          if (!this.$element.attr('data-resize') && !image_mode) {
            this.closeImageMode();
          }
          this.$image_wrapper.hide();
        }
    };
    
    Editable.prototype.hideVideoWrapper = function () {
        if (this.$video_wrapper) {
            this.$video_wrapper.hide();
        }
    };

    Editable.prototype.showInsertLink = function () {
        if (this.options.inlineMode) {
            this.$bttn_wrapper.hide();
        }

        this.showLinkWrapper();
        this.hideImageWrapper(true);
        this.hideVideoWrapper();
        this.$image_editor.hide();

        this.link = true;
    };

    Editable.prototype.showInsertImage = function () {
        if (this.options.inlineMode) {
            this.$bttn_wrapper.hide();
        }
        this.hideLinkWrapper();
        this.hideVideoWrapper();
        this.showImageWrapper();
        this.$image_editor.hide();
    };
    
    Editable.prototype.showInsertVideo = function () {
        if (this.options.inlineMode) {
            this.$bttn_wrapper.hide();
        }
        this.hideLinkWrapper();
        this.hideImageWrapper();
        this.showVideoWrapper();
        this.$image_editor.hide();
    };

    Editable.prototype.showImageEditor = function () {
        if (this.options.inlineMode) {
            this.$bttn_wrapper.hide();
        }
        this.hideLinkWrapper();
        this.hideImageWrapper(true);
        this.hideVideoWrapper();
        this.$image_editor.show();
        if (!this.options.imageMove) {
            this.$element.attr('contenteditable', false);
        }
    };

    /**
     * Hide inline editor.
     */
    Editable.prototype.hide = function () {
        this.$popup_editor.hide();
        this.hideLinkWrapper();
        this.hideImageWrapper();
        this.hideVideoWrapper();
        this.$image_editor.hide();
        this.link = false;
    };

    /**
     * Set position for popup editor.
     */
    Editable.prototype.positionPopup = function (command) {
        if ($(this.$editor.find('button.fr-bttn[data-cmd="' + command + '"]')).length) {
            this.$popup_editor.css('top', this.$editor.find('button.fr-bttn[data-cmd="' + command + '"]').offset().top + 30);
            this.$popup_editor.css('left', this.$editor.find('button.fr-bttn[data-cmd="' + command + '"]').offset().left);
            this.$popup_editor.show();
        }
    };

    /**
     * Bind events for buttons.
     */
    Editable.prototype.bindButtonEvents = function () {
        this.bindDropdownEvents();

        this.bindCommandEvents();
    };

    /**
     * Bind events for dropdown.
     */
    Editable.prototype.bindDropdownEvents = function () {
        var that = this;
      
        // Dropdown event.
        this.$bttn_wrapper.find('.fr-dropdown').on('click touchend', function (e) {
            e.stopPropagation();
            e.preventDefault();
            
            if (that.options.inlineMode === false) {
              that.hide();
            }

            if ($(this).attr('data-disabled')) {
                return false;
            }

            $('.fr-dropdown').not(this).removeClass('active');
            $(this).toggleClass('active');
        });

        $(window).on('click touchend', $.proxy(function () {
            this.$editor.find('.fr-dropdown').removeClass('active');
        }, this));
        
        this.$element.on('click touchend', 'img, a', $.proxy(function () {
            this.$editor.find('.fr-dropdown').removeClass('active');
        }, this));

        // Dropdown selector event.
        var $selectors = this.$bttn_wrapper.find('.fr-selector button.fr-bttn');
        $selectors
            .bind('select', function () {
                $(this).parents('.fr-selector').find(' > button > i').attr('class', $(this).find('i').attr('class'));
            })
            .on('click touch', function () {
                $(this).parents('ul').find('button').removeClass('active');
                $(this).parents('.fr-selector').removeClass('active').trigger("mouseout");
                $(this).trigger('select');
            });
    };

    /**
     * Bind events for button command.
     */
    Editable.prototype.bindCommandEvents = function () {
        this.$bttn_wrapper.find('[data-cmd]').on('click touchend', $.proxy(function (e) {
            e.stopPropagation();
            e.preventDefault();

            var elem = e.currentTarget;
            var cmd = $(elem).data('cmd');
            var val = $(elem).data('val');

            $(elem).parents('.fr-dropdown').removeClass('active');

            this.exec(cmd, val);
            
            this.$bttn_wrapper.find('.fr-dropdown').removeClass('active');
        }, this));
    };

    /**
     * Exec command.
     *
     * @param cmd
     * @param val
     * @returns {boolean}
     */
    Editable.prototype.exec = function (cmd, val) {
        if (!this.selectionInEditor() && cmd !== 'html' && cmd !== 'undo' && cmd !== 'redo' && cmd !== 'selectAll' && cmd != 'save' && cmd !== 'insertImage' && cmd !== 'insertVideo') {
            return false;
        }
        else if (this.selectionInEditor()) {
          if (this.text() === '' && (cmd === 'bold' || cmd === 'italic' || cmd === 'underline' || cmd == 'strikeThrough')) {
            this.$element.focus()
            this.$bttn_wrapper.find('[data-cmd="' + cmd + '"]').toggleClass('active')
            document.execCommand(cmd)
            return false;
          }
          
          if (this.text() === '' && cmd !== 'fontSize' && cmd !== 'formatBlock' && cmd !== 'indent' && cmd !== 'outdent' && cmd !== 'justifyLeft' && cmd !== 'justifyRight' && cmd !== 'justifyFull' && cmd !== 'justifyCenter' && cmd !== 'html' && cmd !== 'undo' && cmd !== 'redo' && cmd !== 'selectAll' && cmd !== 'save' && cmd !== 'insertImage' && cmd !== 'insertVideo' && cmd !== 'insertOrderedList' && cmd !== 'insertUnorderedList') {
            return false;
          }
        }

        switch (cmd) {
            case 'fontSize':
                this.fontSize(val);
                break;

            case 'backColor':
                this.backColor(val);
                break;

            case 'foreColor':
                this.foreColor(val);
                break;

            case 'formatBlock':
                this.formatBlock(val);
                break;

            case 'createLink':
                this.insertLink();
                break;

            case 'insertImage':
                this.insertImage();
                break;

            case 'indent':
                this.indent();
                break;

            case 'outdent':
                this.outdent(true);
                break;

            case 'justifyLeft': case 'justifyRight': case 'justifyCenter': case 'justifyFull':
                this.align(cmd);
                break;

            case 'insertOrderedList': case 'insertUnorderedList':
                this.formatList(cmd);
                break;
                
              case 'insertVideo':
                this.insertVideo();
                break;

            case 'indent': case 'outdent':
                this.execDefault(cmd, val);
                this.repositionEditor();
                break;

            case 'undo':
                this.undo();
                break;

            case 'redo':
                this.redo();
                break;

            case 'html':
                this.html();
                break;

            case 'save':
                this.save();
                break;

            case 'selectAll':
                this.$element.focus();
                this.execDefault(cmd, val);
                break;

            default:
                this.execDefault(cmd, val);
        }

        if (cmd != 'undo' && cmd != 'redo' && cmd != 'selectAll' && cmd != 'createLink' && cmd != 'insertImage' && cmd != 'html' && cmd != 'insertVideo') {
            this.saveUndoStep();
        }

        if (cmd != 'createLink' && cmd != 'insertImage') {
            this.refreshButtons();
        }
    };
    
    /**
     * Remove format.
     */
    Editable.prototype.removeFormat = function () {
      document.execCommand('removeFormat',false,false);
      document.execCommand('unlink',false,false);
    }

    /**
     * Undo.
     */
    Editable.prototype.undo = function () {
        if (this.undoIndex > 1) {
            var cHTML = this.getHTML();

            var step = this.undoStack[--this.undoIndex - 1];
            this.$element.html(step);
            this.$element.focus();
            this.restoreSelectionByMarkers();
            this.hide();

            // (newHTML, oldHTML)
            this.callback('undo', [this.$element.html(), cHTML]);
        }

        this.refreshUndoRedo();
    };

    /**
     * Redo.
     */
    Editable.prototype.redo = function () {
        if (this.undoIndex < this.undoStack.length) {
            var cHTML = this.$element.html();

            var step = this.undoStack[this.undoIndex++]
            this.$element.html(step);
            this.$element.focus();
            this.restoreSelectionByMarkers();
            this.hide();
            
            // (newHTML, oldHTML)
            this.callback('redo', [this.$element.html(), cHTML]);
        }

        this.refreshUndoRedo();
    };

    /**
     * Save in DB.
     */
    Editable.prototype.save = function () {
        if  (this.options.saveURL) {
            this.callback('beforeSave');

            $.post(this.options.saveURL, $.extend({body: this.getHTML()}, this.options.saveParams), $.proxy(function (data) {
              // data
                this.callback('afterSave', [data]);
            }, this))
            .fail ($.proxy(function () {
              // (error)
              this.callback('saveError', ['Save request failed on the server.']);
            }, this));
        }
        else {
          // (error)
          this.callback('saveError', ['Missing save URL.']);
        }
    };

    /**
     * Set html.
     */
    Editable.prototype.html = function () {
        var html;
        
        if (this.isHTML) {
            this.isHTML = false;
            
            var html;
            
            if (this.options.enableScript) {
              html = this.$html_area.val();
            }
            else {
              html = this.stripScript(this.$html_area.val());
            }
            
            html = this.cleanNewLine(html);
            
            this.$element.html(html).attr('contenteditable', true);
            this.$box.removeClass('f-html');
            this.$editor.find('.fr-bttn:not([data-cmd="html"])').prop('disabled', false);
            this.$editor.find('div.fr-bttn').removeAttr('data-disabled');
            this.$editor.find('.fr-bttn[data-cmd="html"]').removeClass('active');
            this.saveUndoStep();
            
            this.wrapText();

            // (html)
            this.callback('htmlHide', [html]);
        }
        else {
            if (this.options.inlineMode) {
              html = '\n\n' + this.getHTML();
            }
            else {
              html = html_beautify(this.getHTML())
            }
            this.$html_area.val(html).trigger('resize');

            if (this.options.inlineMode) {
                this.$box.find('.html-switch').css('top', this.$box.css('padding-top'));
            }

            this.$html_area.css('height', this.$element.height() + 20);
            this.$element.html(this.$html_area).removeAttr('contenteditable');
            this.$box.addClass('f-html');
            this.$editor.find('button.fr-bttn:not([data-cmd="html"])').prop('disabled', true);
            this.$editor.find('div.fr-bttn').attr('data-disabled', true);
            this.$editor.find('.fr-bttn[data-cmd="html"]').addClass('active');

            if (this.options.inlineMode) {
                this.hide();
            }
            
            this.isHTML = true;
            
            // html
            this.callback('htmlShow', [html]);
        }
    };

    /**
     * Set font size.
     *
     * @param val
     */
    Editable.prototype.fontSize = function (val) {

        document.execCommand('fontSize', false, 1);

        this.saveSelectionByMarkers();
        
        // Remove all fonts with size=3.
        var main_fonts = [];
        this.$element.find('font').each (function (index, elem) {
            var $span = $('<span>').attr('data-font', true).css('font-size', val).html($(elem).html());
            if ($(elem).parents('font').length === 0) {
                main_fonts.push($span);
            }
            $(elem).replaceWith($span);
        });
        
        var setFontSize = function (i, elem) {
            $(elem).css('font-size', '');
        };

        // Set font-size for the fonts.
        for (var i in main_fonts) {
            var font = main_fonts[i];
            $(font).find('*').each (setFontSize);
        }
        
        this.$element.find('span[data-font="true"] > span[data-font="true"]').each (function (index, elem) {
          if ($(elem).attr('style')) {
            $(elem).before('<span class="close-span"></span>');
            $(elem).after('<span data-font="true" style="font-size: ' + $(elem).parent().css('font-size') + '" data-open="true"></span>');
          }
        });
        
        var oldHTML = this.$element.html();
        oldHTML = oldHTML.replace(new RegExp('<span class="close-span"></span>', 'g'), '</span>');
        oldHTML = oldHTML.replace(new RegExp('data-open="true"></span>', 'g'), '>');
        
        this.$element.html(oldHTML);
        
        var found = true;
        var cleanFont = $.proxy(function () {
          this.$element.find('span[data-font="true"] + span[data-font="true"]').each (function (index, elem) {
            if ($(elem).css('font-size') == $(elem).prev().css('font-size')) {
              $(elem).prepend($(elem).prev().html());
              $(elem).prev().remove();
              found = true;
            }
          });
          
          this.$element.find('span[data-font="true"] + span#marker-true + span[data-font="true"], span[data-font="true"] + span#marker-true + span[data-font="true"]').each (function (index, elem) {
            if ($(elem).css('font-size') == $(elem).prev().prev().css('font-size')) {
              $(elem).prepend($(elem).prev().clone());
              $(elem).prepend($(elem).prev().prev().html());
              $(elem).prev().prev().remove();
              $(elem).prev().remove();
              found = true;
            }
          });
        }, this);
        
        while (found) {
          found = false;
          
          cleanFont();
        }
        
        this.$element.find('span[style=""]').each (function (index, elem) {
          $(elem).replaceWith($(elem).html());
        });
        
        this.$element.find('span[data-font]').each (function (index, elem) {
          if ($(elem).css('font-size') == $(elem).parent().css('font-size')) {
            $(elem).replaceWith($(elem).html());
          }
        });
        
        this.restoreSelectionByMarkers();
        this.repositionEditor();

        this.callback('fontSize');
    };

    /**
     * Set background color.
     *
     * @param val
     */
    Editable.prototype.backColor = function (val) {
        var cmd = 'backColor';

        if (!this.browser.msie) {
            cmd = 'hiliteColor';
        }

        var oldColor = $(this.getSelectionElement()).css('background-color');

        document.execCommand(cmd, false, val);

        // Mark current color selected.
        var $elem = this.$editor.find('button.fr-color-bttn[data-cmd="backColor"][data-val="'+ val +'"]');
        $elem.addClass('active');
        $elem.siblings().removeClass('active');

        // (newColor, oldColor)
        this.callback('backColor', [Editable.hexToRGBString(val), oldColor]);
    };

    /**
     * Set foreground color.
     *
     * @param val
     */
    Editable.prototype.foreColor = function (val) {
        var oldColor = $(this.getSelectionElement()).css('color');

        document.execCommand('foreColor', false, val);

        this.saveSelectionByMarkers();

        this.$element.find('font[color]').each (function (index, elem) {
            $(elem).replaceWith($('<span>').css('color', val).html($(elem).html()));
        });

        this.restoreSelectionByMarkers();

        // Mark current color selected.
        var $elem = this.$editor.find('button.fr-color-bttn[data-cmd="foreColor"][data-val="'+ val +'"]');
        $elem.addClass('active');
        $elem.siblings().removeClass('active');

        // (newColor, oldColor)
        this.callback('foreColor', [Editable.hexToRGBString(val), oldColor]);
    };

    /**
     * Format block.
     *
     * @param val
     */
    Editable.prototype.formatBlock = function (val) {
      if (this.disabledList.indexOf('formatBlock') >= 0) {
          return false;
      }

      // Wrap text.
      this.saveSelectionByMarkers();
      this.wrapText();
      this.restoreSelectionByMarkers();

      var elements = this.getSelectionElements();
      this.saveSelectionByMarkers();
      var $sel;

      for (var i in elements) {
          var $element = $(elements[i]);

          // Format or no format.
          if (val == 'n') {
              $sel = $('<div>').html($element.html());
          }
          else {
              $sel = $('<' + val + '>').html($element.html());
          }

          if ($element.get(0) != this.$element.get(0) && $element.get(0).tagName != 'LI') {
              var attributes = $element.prop("attributes");

              if ($sel.attr) {
                  for (var j in attributes) {
                      $sel.attr(attributes[j].name, attributes[j].value);
                  }
              }

              $element.replaceWith($sel);
          }
          else {
              $element.html($sel);
          }
      }

      this.restoreSelectionByMarkers();
      this.hide();
      
      this.callback('formatBlock');
    };

    Editable.prototype.formatList = function (cmd) {

      this.saveSelectionByMarkers();

      var elements = this.getSelectionElements();

      var all = true;
      var replaced = false;
      
      var $element;

      // Clean elements.
      for (var i in elements) {
          $element = $(elements[i]);

          if ($element.parents('li').length > 0) {
              if ($element.parents('ol').length > 0) {
                  $element.parents('li').before('<span class="close-ol"></span>');
                  $element.parents('li').after('<span class="open-ol"></span>');
              }
              else if ($element.parents('ul').length > 0) {
                  $element.parents('li').before('<span class="close-ul"></span>');
                  $element.parents('li').after('<span class="open-ul"></span>');
              }
              $element.parents('li').replaceWith($element.parents('li').contents());

              replaced = true;
          }
          else {
              all = false;
          }
      }

      if (replaced) {
          var oldHTML = this.$element.html();
          oldHTML = oldHTML.replace(new RegExp('<span class="close-ul"></span>', 'g'), '</ul>');
          oldHTML = oldHTML.replace(new RegExp('<span class="open-ul"></span>', 'g'), '<ul>');
          oldHTML = oldHTML.replace(new RegExp('<span class="close-ol"></span>', 'g'), '</ol>');
          oldHTML = oldHTML.replace(new RegExp('<span class="open-ol"></span>', 'g'), '<ol>');
          this.$element.html(oldHTML);

          this.$element.find('ul:empty, ol:empty').remove();
      }

      this.clearSelection();
      this.wrapText();

      this.restoreSelectionByMarkers();

      if (all === false ) {
        
          elements = this.getSelectionElements();

          this.saveSelectionByMarkers();

          var $list = $('<ol>');
          if (cmd == 'insertUnorderedList') {
              $list = $('<ul>');
          }
          for (var j in elements) {
              $element = $(elements[j]);

              if ($element.get(0) == this.$element.get(0)) {
                  continue;
              }

              $list.append($('<li>').append($element.clone()));
              if (j != elements.length - 1) {
                $element.remove();
              }
              else {
                $element.replaceWith($list);
                $list.find('li')
              }
          }

          this.restoreSelectionByMarkers();
      }
      
      this.repositionEditor();

      this.callback(cmd);
    };

    /**
     * Align.
     *
     * @param val
     */
    Editable.prototype.align = function (val) {
        var elements = this.getSelectionElements();

        this.saveSelection();

        if (val == 'justifyLeft') {
            val = 'left';
        }
        else if (val == 'justifyRight') {
            val = 'right';
        }
        else if (val == 'justifyCenter') {
            val = 'center';
        }
        else if (val == 'justifyFull') {
            val = 'justify';
        }

        for (var i in elements) {
            $(elements[i]).css('text-align', val);
        }

        this.restoreSelection();

        this.repositionEditor();

        this.callback('align');
    };

    /**
     * Indent.
     *
     * @param outdent - boolean.
     */
    Editable.prototype.indent = function (outdent) {
        var margin = 20;
        if (outdent) {
            margin = -20;
        }

        // Wrap text.
        this.saveSelectionByMarkers();
        this.wrapText();
        this.restoreSelectionByMarkers();

        var elements = this.getSelectionElements();

        this.saveSelectionByMarkers();

        for (var i in elements) {
            var $element = $(elements[i]);

            if ($element.get(0) != this.$element.get(0)) {
                var oldMargin = parseInt($element.css('margin-left').replace(/px/, ''), 10);
                var newMargin = Math.max(0, oldMargin + margin);
                $element.css('marginLeft', newMargin);
            }
            else {
                var $sel = $('<div>').html($element.html());
                $element.html($sel);
                $sel.css('marginLeft', Math.max(0, margin));
            }
        }

        this.restoreSelectionByMarkers();
        this.repositionEditor();

        if (!outdent) {
          this.callback('indent');
        }
    };

    /**
     * Outdent.
     */
    Editable.prototype.outdent = function () {
        this.indent(true);

        this.callback('outdent');
    };

    /**
     * Insert link.
     */
    Editable.prototype.insertLink = function () {
        this.showInsertLink();

        if (!this.options.inlineMode) {
            this.positionPopup('createLink');
        }

        this.saveSelection();

        var link = this.getSelectionLink();
        var links = this.getSelectionLinks();
        if (links.length > 0) {
            this.$link_wrapper.find('input[type="checkbox"]').prop('checked', $(links[0]).attr('target') == '_blank');
        }
        else {
          this.$link_wrapper.find('input[type="checkbox"]').prop('checked', this.options.alwaysBlank);
        }

        this.$link_wrapper.find('input[type="text"]').val(link || 'http://');
    };

    /**
     * Insert image.
     */
    Editable.prototype.insertImage = function () {
        this.showInsertImage();

        this.saveSelection();

        if (!this.options.inlineMode) {
            this.positionPopup('insertImage');
        }


        this.$image_wrapper.find('input[type="text"]').val('');
    };
    
    /**
     * Insert video.
     */
    Editable.prototype.insertVideo = function () {
        this.showInsertVideo();

        this.saveSelection();

        if (!this.options.inlineMode) {
            this.positionPopup('insertVideo');
        }


        this.$video_wrapper.find('textarea').val('');
    };

    /**
     * Run default command.
     *
     * @param cmd - command name.
     * @param val - command value.
     */
    Editable.prototype.execDefault = function (cmd, val) {
        document.execCommand(cmd, false, val);

        if (cmd == 'insertOrderedList') {
            this.$bttn_wrapper.find('[data-cmd="insertUnorderedList"]').removeClass('active');
        }
        else if (cmd == 'insertUnorderedList') {
            this.$bttn_wrapper.find('[data-cmd="insertOrderedList"]').removeClass('active');
        }

        this.callback(cmd);
    };

    /**
     * Refresh button state.
     */
    Editable.prototype.refreshButtons = function () {

        if (!this.selectionInEditor() || this.isHTML) {
            return false;
        }

        this.refreshUndoRedo();

        this.$bttn_wrapper.find('[data-cmd]').each($.proxy(function (index, elem) {
            switch ($(elem).data('cmd')) {
                case 'fontSize':
                    this.refreshFontSize(elem);
                    break;

                case 'backColor':
                    this.refreshBackColor(elem);
                    break;

                case 'foreColor':
                    this.refreshForeColor(elem);
                    break;

                case 'formatBlock':
                    this.refreshFormatBlock(elem);
                    break;

                case 'createLink': case 'insertImage':
                break;

                case 'justifyLeft': case 'justifyRight': case 'justifyCenter': case 'justifyFull':
                    this.refreshAlign(elem);
                break;

                case 'html':
                    if (this.isHTML) {
                        $(elem).addClass('active');
                    }
                    else {
                        $(elem).removeClass('active');
                    }
                    break;

                case 'undo':case 'redo': case 'save':
                break;

                default:
                    this.refreshDefault(elem);
            }
        }, this));
    };

    /**
     * Refresh format block.
     *
     * @param elem
     */
    Editable.prototype.refreshFormatBlock = function (elem) {
        if (this.disabledList.indexOf('formatBlock') >= 0) {
            $(elem).parents('.fr-dropdown').attr('data-disabled', true);
        }
    };

    /**
     * Refresh undo, redo buttons.
     */
    Editable.prototype.refreshUndoRedo = function () {

        if (this.isEnabled('undo') || this.isEnabled('redo')) {
            if (this.$editor === undefined) return;

            this.$bttn_wrapper.find('[data-cmd="undo"], [data-cmd="redo"]').prop('disabled', false);

            if (this.undoStack.length === 0 || this.undoIndex <= 1 || this.isHTML) {
                this.$bttn_wrapper.find('[data-cmd="undo"]').prop('disabled', true);
            }

            if (this.undoIndex == this.undoStack.length || this.isHTML) {
                this.$bttn_wrapper.find('[data-cmd="redo"]').prop('disabled', true);
            }
        }
    };

    /**
     * Refresh default buttons.
     *
     * @param elem
     */
    Editable.prototype.refreshDefault = function (elem) {
        $(elem).removeClass('active');

        try {
            if (document.queryCommandState($(elem).data('cmd')) === true) {
                $(elem).addClass('active');
            }
        }
        catch (ex) { }
    };

    /**
     * Refresh alignment.
     *
     * @param elem
     */
    Editable.prototype.refreshAlign = function (elem) {
        var cmd = $(elem).data('cmd');

        var elements = this.getSelectionElements();

        if (cmd == 'justifyLeft') {
            cmd = 'left';
        }
        else if (cmd == 'justifyRight') {
            cmd = 'right';
        }
        else if (cmd == 'justifyCenter') {
            cmd = 'center';
        }
        else if (cmd == 'justifyFull') {
            cmd = 'justify';
        }

        if (cmd == $(elements[0]).css('text-align')) {
            $(elem).parents('ul').find('.fr-bttn').removeClass('active');
            $(elem).addClass('active');
            $(elem).parents('.fr-dropdown').find('.fr-trigger').html($(elem).html());
        }
    };

    /**
     * Refresh foreground color.
     *
     * @param elem
     */
    Editable.prototype.refreshForeColor = function (elem) {
        $(elem).removeClass('active');
        if (document.queryCommandValue('foreColor') == elem.style.backgroundColor) {
            $(elem).addClass('active');
        }
    };

    /**
     * Refresh background color.
     *
     * @param elem
     */
    Editable.prototype.refreshBackColor = function (elem) {
        $(elem).removeClass('active');

        if (document.queryCommandValue('backColor') == elem.style.backgroundColor) {
            $(elem).addClass('active');
        }
    };

    /**
     * Refresh font size.
     *
     * @param elem
     */
    Editable.prototype.refreshFontSize = function (elem) {
        $(elem).removeClass('active');
        if (parseInt(document.queryCommandValue('fontSize'), 10) == parseInt($(elem).data('val'), 10)) {
            $(elem).addClass('active');
        }
    };

    Editable.prototype.option = function (prop, val) {
        if (prop === undefined ) {
            return this.options;
        }
        else if (prop instanceof Object) {
            this.options = $.extend({}, this.options, prop);

            this.initOptions();
            this.setCustomText();
            this.setLanguage();
            this.setTextNearImage();
        }
        else if (val !== undefined) {
            this.options[prop] = val;

            switch (prop) {
                case 'borderColor':
                    this.setBorderColor();
                    break;
                case 'direction':
                    this.setDirection();
                    break;
                case 'height':case 'width':case 'minHeight':
                    this.setDimensions();
                    break;
                case 'spellcheck':
                    this.setSpellcheck();
                    break;
                case 'placeholder':
                    this.setPlaceholder();
                    break;
                case 'customText':
                    this.setCustomText();
                    break;
                case 'inverseSkin':
                    this.setInverseSkin();
                    break;
                case 'language':
                    this.setLanguage();
                    break;
                case 'textNearImage':
                    this.setTextNearImage();
                    break;
            }
        }
        else {
            return this.options[prop];
        }
    };

    // EDITABLE PLUGIN DEFINITION
     // ==========================

    var old = $.fn.editable;

    $.fn.editable = function (option) {
        var arg_list = [];
        for (var i = 0; i < arguments.length; i++) {
            arg_list.push(arguments[i]);
        }

        $('html').data('editable', true);

        if (typeof option == 'string') {
            var return_array = [];
            this.each(function () {
                var $this = $(this);
                var data = $this.data('fa.editable');

                //if (!data) $this.data('fa.editable', (data = new Editable(this, option)));

                var return_value = data[option].apply(data, arg_list.slice(1));
                if (return_value === undefined) {
                  return_array.push(this);
                }
                else {
                   return_array.push(return_value);
                }
            });

            return return_array;
        }
        else {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data('fa.editable');

                if (!data) $this.data('fa.editable', (data = new Editable(this, option)));
            });
        }
    };

    $.fn.editable.Constructor = Editable;
    $.Editable = Editable;

    $.fn.editable.noConflict = function () {
        $.fn.editable = old;
        return this;
    };
}(window.jQuery);

// jquery.event.move
//
// 1.3.6
//
// Stephen Band
//
// Triggers 'movestart', 'move' and 'moveend' events after
// mousemoves following a mousedown cross a distance threshold,
// similar to the native 'dragstart', 'drag' and 'dragend' events.
// Move events are throttled to animation frames. Move event objects
// have the properties:
//
// pageX:
// pageY:   Page coordinates of pointer.
// startX:
// startY:  Page coordinates of pointer at movestart.
// distX:
// distY:  Distance the pointer has moved since movestart.
// deltaX:
// deltaY:  Distance the finger has moved since last event.
// velocityX:
// velocityY:  Average velocity over last few events.


(function (module) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery'], module);
	} else {
		// Browser globals
		module(jQuery);
	}
})(function(jQuery, undefined){

	var // Number of pixels a pressed pointer travels before movestart
	    // event is fired.
	    threshold = 6,
	
	    add = jQuery.event.add,
	
	    remove = jQuery.event.remove,

	    // Just sugar, so we can have arguments in the same order as
	    // add and remove.
	    trigger = function(node, type, data) {
	    	jQuery.event.trigger(type, data, node);
	    },

	    // Shim for requestAnimationFrame, falling back to timer. See:
	    // see http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	    requestFrame = (function(){
	    	return (
	    		window.requestAnimationFrame ||
	    		window.webkitRequestAnimationFrame ||
	    		window.mozRequestAnimationFrame ||
	    		window.oRequestAnimationFrame ||
	    		window.msRequestAnimationFrame ||
	    		function(fn, element){
	    			return window.setTimeout(function(){
	    				fn();
	    			}, 25);
	    		}
	    	);
	    })(),
	    
	    ignoreTags = {
	    	textarea: true,
	    	input: true,
	    	select: true,
	    	button: true
	    },
	    
	    mouseevents = {
	    	move: 'mousemove',
	    	cancel: 'mouseup dragstart',
	    	end: 'mouseup'
	    },
	    
	    touchevents = {
	    	move: 'touchmove',
	    	cancel: 'touchend',
	    	end: 'touchend'
	    };


	// Constructors
	
	function Timer(fn){
		var callback = fn,
		    active = false,
		    running = false;
		
		function trigger(time) {
			if (active){
				callback();
				requestFrame(trigger);
				running = true;
				active = false;
			}
			else {
				running = false;
			}
		}
		
		this.kick = function(fn) {
			active = true;
			if (!running) { trigger(); }
		};
		
		this.end = function(fn) {
			var cb = callback;
			
			if (!fn) { return; }
			
			// If the timer is not running, simply call the end callback.
			if (!running) {
				fn();
			}
			// If the timer is running, and has been kicked lately, then
			// queue up the current callback and the end callback, otherwise
			// just the end callback.
			else {
				callback = active ?
					function(){ cb(); fn(); } : 
					fn ;
				
				active = true;
			}
		};
	}


	// Functions
	
	function returnTrue() {
		return true;
	}
	
	function returnFalse() {
		return false;
	}
	
	function preventDefault(e) {
		e.preventDefault();
	}
	
	function preventIgnoreTags(e) {
		// Don't prevent interaction with form elements.
		if (ignoreTags[ e.target.tagName.toLowerCase() ]) { return; }
		
		e.preventDefault();
	}

	function isLeftButton(e) {
		// Ignore mousedowns on any button other than the left (or primary)
		// mouse button, or when a modifier key is pressed.
		return (e.which === 1 && !e.ctrlKey && !e.altKey);
	}

	function identifiedTouch(touchList, id) {
		var i, l;

		if (touchList.identifiedTouch) {
			return touchList.identifiedTouch(id);
		}
		
		// touchList.identifiedTouch() does not exist in
		// webkit yet… we must do the search ourselves...
		
		i = -1;
		l = touchList.length;
		
		while (++i < l) {
			if (touchList[i].identifier === id) {
				return touchList[i];
			}
		}
	}

	function changedTouch(e, event) {
		var touch = identifiedTouch(e.changedTouches, event.identifier);

		// This isn't the touch you're looking for.
		if (!touch) { return; }

		// Chrome Android (at least) includes touches that have not
		// changed in e.changedTouches. That's a bit annoying. Check
		// that this touch has changed.
		if (touch.pageX === event.pageX && touch.pageY === event.pageY) { return; }

		return touch;
	}


	// Handlers that decide when the first movestart is triggered
	
	function mousedown(e){
		var data;

		if (!isLeftButton(e)) { return; }

		data = {
			target: e.target,
			startX: e.pageX,
			startY: e.pageY,
			timeStamp: e.timeStamp
		};

		add(document, mouseevents.move, mousemove, data);
		add(document, mouseevents.cancel, mouseend, data);
	}

	function mousemove(e){
		var data = e.data;

		checkThreshold(e, data, e, removeMouse);
	}

	function mouseend(e) {
		removeMouse();
	}

	function removeMouse() {
		remove(document, mouseevents.move, mousemove);
		remove(document, mouseevents.cancel, mouseend);
	}

	function touchstart(e) {
		var touch, template;

		// Don't get in the way of interaction with form elements.
		if (ignoreTags[ e.target.tagName.toLowerCase() ]) { return; }

		touch = e.changedTouches[0];
		
		// iOS live updates the touch objects whereas Android gives us copies.
		// That means we can't trust the touchstart object to stay the same,
		// so we must copy the data. This object acts as a template for
		// movestart, move and moveend event objects.
		template = {
			target: touch.target,
			startX: touch.pageX,
			startY: touch.pageY,
			timeStamp: e.timeStamp,
			identifier: touch.identifier
		};

		// Use the touch identifier as a namespace, so that we can later
		// remove handlers pertaining only to this touch.
		add(document, touchevents.move + '.' + touch.identifier, touchmove, template);
		add(document, touchevents.cancel + '.' + touch.identifier, touchend, template);
	}

	function touchmove(e){
		var data = e.data,
		    touch = changedTouch(e, data);

		if (!touch) { return; }

		checkThreshold(e, data, touch, removeTouch);
	}

	function touchend(e) {
		var template = e.data,
		    touch = identifiedTouch(e.changedTouches, template.identifier);

		if (!touch) { return; }

		removeTouch(template.identifier);
	}

	function removeTouch(identifier) {
		remove(document, '.' + identifier, touchmove);
		remove(document, '.' + identifier, touchend);
	}


	// Logic for deciding when to trigger a movestart.

	function checkThreshold(e, template, touch, fn) {
		var distX = touch.pageX - template.startX,
		    distY = touch.pageY - template.startY;

		// Do nothing if the threshold has not been crossed.
		if ((distX * distX) + (distY * distY) < (threshold * threshold)) { return; }

		triggerStart(e, template, touch, distX, distY, fn);
	}

	function handled() {
		// this._handled should return false once, and after return true.
		this._handled = returnTrue;
		return false;
	}

	function flagAsHandled(e) {
    try {
      e._handled();
    }
    catch(ex) {
      return false;
    }
	}

	function triggerStart(e, template, touch, distX, distY, fn) {
		var node = template.target,
		    touches, time;

		touches = e.targetTouches;
		time = e.timeStamp - template.timeStamp;

		// Create a movestart object with some special properties that
		// are passed only to the movestart handlers.
		template.type = 'movestart';
		template.distX = distX;
		template.distY = distY;
		template.deltaX = distX;
		template.deltaY = distY;
		template.pageX = touch.pageX;
		template.pageY = touch.pageY;
		template.velocityX = distX / time;
		template.velocityY = distY / time;
		template.targetTouches = touches;
		template.finger = touches ?
			touches.length :
			1 ;

		// The _handled method is fired to tell the default movestart
		// handler that one of the move events is bound.
		template._handled = handled;
			
		// Pass the touchmove event so it can be prevented if or when
		// movestart is handled.
		template._preventTouchmoveDefault = function() {
			e.preventDefault();
		};

		// Trigger the movestart event.
		trigger(template.target, template);

		// Unbind handlers that tracked the touch or mouse up till now.
		fn(template.identifier);
	}


	// Handlers that control what happens following a movestart

	function activeMousemove(e) {
		var timer = e.data.timer;

		e.data.touch = e;
		e.data.timeStamp = e.timeStamp;
		timer.kick();
	}

	function activeMouseend(e) {
		var event = e.data.event,
		    timer = e.data.timer;
		
		removeActiveMouse();

		endEvent(event, timer, function() {
			// Unbind the click suppressor, waiting until after mouseup
			// has been handled.
			setTimeout(function(){
				remove(event.target, 'click', returnFalse);
			}, 0);
		});
	}

	function removeActiveMouse(event) {
		remove(document, mouseevents.move, activeMousemove);
		remove(document, mouseevents.end, activeMouseend);
	}

	function activeTouchmove(e) {
		var event = e.data.event,
		    timer = e.data.timer,
		    touch = changedTouch(e, event);

		if (!touch) { return; }

		// Stop the interface from gesturing
		e.preventDefault();

		event.targetTouches = e.targetTouches;
		e.data.touch = touch;
		e.data.timeStamp = e.timeStamp;
		timer.kick();
	}

	function activeTouchend(e) {
		var event = e.data.event,
		    timer = e.data.timer,
		    touch = identifiedTouch(e.changedTouches, event.identifier);

		// This isn't the touch you're looking for.
		if (!touch) { return; }

		removeActiveTouch(event);
		endEvent(event, timer);
	}

	function removeActiveTouch(event) {
		remove(document, '.' + event.identifier, activeTouchmove);
		remove(document, '.' + event.identifier, activeTouchend);
	}


	// Logic for triggering move and moveend events

	function updateEvent(event, touch, timeStamp, timer) {
		var time = timeStamp - event.timeStamp;

		event.type = 'move';
		event.distX =  touch.pageX - event.startX;
		event.distY =  touch.pageY - event.startY;
		event.deltaX = touch.pageX - event.pageX;
		event.deltaY = touch.pageY - event.pageY;
		
		// Average the velocity of the last few events using a decay
		// curve to even out spurious jumps in values.
		event.velocityX = 0.3 * event.velocityX + 0.7 * event.deltaX / time;
		event.velocityY = 0.3 * event.velocityY + 0.7 * event.deltaY / time;
		event.pageX =  touch.pageX;
		event.pageY =  touch.pageY;
	}

	function endEvent(event, timer, fn) {
		timer.end(function(){
			event.type = 'moveend';

			trigger(event.target, event);
			
			return fn && fn();
		});
	}


	// jQuery special event definition

	function setup(data, namespaces, eventHandle) {
		// Stop the node from being dragged
		//add(this, 'dragstart.move drag.move', preventDefault);
		
		// Prevent text selection and touch interface scrolling
		//add(this, 'mousedown.move', preventIgnoreTags);
		
		// Tell movestart default handler that we've handled this
		add(this, 'movestart.move', flagAsHandled);

		// Don't bind to the DOM. For speed.
		return true;
	}
	
	function teardown(namespaces) {
		remove(this, 'dragstart drag', preventDefault);
		remove(this, 'mousedown touchstart', preventIgnoreTags);
		remove(this, 'movestart', flagAsHandled);
		
		// Don't bind to the DOM. For speed.
		return true;
	}
	
	function addMethod(handleObj) {
		// We're not interested in preventing defaults for handlers that
		// come from internal move or moveend bindings
		if (handleObj.namespace === "move" || handleObj.namespace === "moveend") {
			return;
		}
		
		// Stop the node from being dragged
		add(this, 'dragstart.' + handleObj.guid + ' drag.' + handleObj.guid, preventDefault, undefined, handleObj.selector);
		
		// Prevent text selection and touch interface scrolling
		add(this, 'mousedown.' + handleObj.guid, preventIgnoreTags, undefined, handleObj.selector);
	}
	
	function removeMethod(handleObj) {
		if (handleObj.namespace === "move" || handleObj.namespace === "moveend") {
			return;
		}
		
		remove(this, 'dragstart.' + handleObj.guid + ' drag.' + handleObj.guid);
		remove(this, 'mousedown.' + handleObj.guid);
	}
	
	jQuery.event.special.movestart = {
		setup: setup,
		teardown: teardown,
		add: addMethod,
		remove: removeMethod,

		_default: function(e) {
			var event, data;
			
			// If no move events were bound to any ancestors of this
			// target, high tail it out of here.
			if (!e._handled()) { return; }

			function update(time) {
				updateEvent(event, data.touch, data.timeStamp);
				trigger(e.target, event);
			}

			event = {
				target: e.target,
				startX: e.startX,
				startY: e.startY,
				pageX: e.pageX,
				pageY: e.pageY,
				distX: e.distX,
				distY: e.distY,
				deltaX: e.deltaX,
				deltaY: e.deltaY,
				velocityX: e.velocityX,
				velocityY: e.velocityY,
				timeStamp: e.timeStamp,
				identifier: e.identifier,
				targetTouches: e.targetTouches,
				finger: e.finger
			};

			data = {
				event: event,
				timer: new Timer(update),
				touch: undefined,
				timeStamp: undefined
			};
			
			if (e.identifier === undefined) {
				// We're dealing with a mouse
				// Stop clicks from propagating during a move
				add(e.target, 'click', returnFalse);
				add(document, mouseevents.move, activeMousemove, data);
				add(document, mouseevents.end, activeMouseend, data);
			}
			else {
				// We're dealing with a touch. Stop touchmove doing
				// anything defaulty.
				e._preventTouchmoveDefault();
				add(document, touchevents.move + '.' + e.identifier, activeTouchmove, data);
				add(document, touchevents.end + '.' + e.identifier, activeTouchend, data);
			}
		}
	};

	jQuery.event.special.move = {
		setup: function() {
			// Bind a noop to movestart. Why? It's the movestart
			// setup that decides whether other move events are fired.
			add(this, 'movestart.move', jQuery.noop);
		},
		
		teardown: function() {
			remove(this, 'movestart.move', jQuery.noop);
		}
	};
	
	jQuery.event.special.moveend = {
		setup: function() {
			// Bind a noop to movestart. Why? It's the movestart
			// setup that decides whether other move events are fired.
			add(this, 'movestart.moveend', jQuery.noop);
		},
		
		teardown: function() {
			remove(this, 'movestart.moveend', jQuery.noop);
		}
	};

	add(document, 'mousedown.move', mousedown);
	add(document, 'touchstart.move', touchstart);

	// Make jQuery copy touch event properties over to the jQuery event
	// object, if they are not already listed. But only do the ones we
	// really need. IE7/8 do not have Array#indexOf(), but nor do they
	// have touch events, so let's assume we can ignore them.
	if (typeof Array.prototype.indexOf === 'function') {
		(function(jQuery, undefined){
			var props = ["changedTouches", "targetTouches"],
			    l = props.length;
			
			while (l--) {
				if (jQuery.event.props.indexOf(props[l]) === -1) {
					jQuery.event.props.push(props[l]);
				}
			}
		})(jQuery);
	};
});

/* Modernizr 2.7.1 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-touch-mq-teststyles-prefixes
 */
;



window.Modernizr = (function( window, document, undefined ) {

    var version = '2.7.1',

    Modernizr = {},


    docElement = document.documentElement,

    mod = 'modernizr',
    modElem = document.createElement(mod),
    mStyle = modElem.style,

    inputElem  ,


    toString = {}.toString,

    prefixes = ' -webkit- -moz- -o- -ms- '.split(' '),



    tests = {},
    inputs = {},
    attrs = {},

    classes = [],

    slice = classes.slice,

    featureName, 


    injectElementWithStyles = function( rule, callback, nodes, testnames ) {

      var style, ret, node, docOverflow,
          div = document.createElement('div'),
                body = document.body,
                fakeBody = body || document.createElement('body');

      if ( parseInt(nodes, 10) ) {
                      while ( nodes-- ) {
              node = document.createElement('div');
              node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
              div.appendChild(node);
          }
      }

                style = ['&#173;','<style id="s', mod, '">', rule, '</style>'].join('');
      div.id = mod;
          (body ? div : fakeBody).innerHTML += style;
      fakeBody.appendChild(div);
      if ( !body ) {
                fakeBody.style.background = '';
                fakeBody.style.overflow = 'hidden';
          docOverflow = docElement.style.overflow;
          docElement.style.overflow = 'hidden';
          docElement.appendChild(fakeBody);
      }

      ret = callback(div, rule);
        if ( !body ) {
          fakeBody.parentNode.removeChild(fakeBody);
          docElement.style.overflow = docOverflow;
      } else {
          div.parentNode.removeChild(div);
      }

      return !!ret;

    },

    testMediaQuery = function( mq ) {

      var matchMedia = window.matchMedia || window.msMatchMedia;
      if ( matchMedia ) {
        return matchMedia(mq).matches;
      }

      var bool;

      injectElementWithStyles('@media ' + mq + ' { #' + mod + ' { position: absolute; } }', function( node ) {
        bool = (window.getComputedStyle ?
                  getComputedStyle(node, null) :
                  node.currentStyle)['position'] == 'absolute';
      });

      return bool;

     },
    _hasOwnProperty = ({}).hasOwnProperty, hasOwnProp;

    if ( !is(_hasOwnProperty, 'undefined') && !is(_hasOwnProperty.call, 'undefined') ) {
      hasOwnProp = function (object, property) {
        return _hasOwnProperty.call(object, property);
      };
    }
    else {
      hasOwnProp = function (object, property) { 
        return ((property in object) && is(object.constructor.prototype[property], 'undefined'));
      };
    }


    if (!Function.prototype.bind) {
      Function.prototype.bind = function bind(that) {

        var target = this;

        if (typeof target != "function") {
            throw new TypeError();
        }

        var args = slice.call(arguments, 1),
            bound = function () {

            if (this instanceof bound) {

              var F = function(){};
              F.prototype = target.prototype;
              var self = new F();

              var result = target.apply(
                  self,
                  args.concat(slice.call(arguments))
              );
              if (Object(result) === result) {
                  return result;
              }
              return self;

            } else {

              return target.apply(
                  that,
                  args.concat(slice.call(arguments))
              );

            }

        };

        return bound;
      };
    }

    function setCss( str ) {
        mStyle.cssText = str;
    }

    function setCssAll( str1, str2 ) {
        return setCss(prefixes.join(str1 + ';') + ( str2 || '' ));
    }

    function is( obj, type ) {
        return typeof obj === type;
    }

    function contains( str, substr ) {
        return !!~('' + str).indexOf(substr);
    }


    function testDOMProps( props, obj, elem ) {
        for ( var i in props ) {
            var item = obj[props[i]];
            if ( item !== undefined) {

                            if (elem === false) return props[i];

                            if (is(item, 'function')){
                                return item.bind(elem || obj);
                }

                            return item;
            }
        }
        return false;
    }
    tests['touch'] = function() {
        var bool;

        if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
          bool = true;
        } else {
          injectElementWithStyles(['@media (',prefixes.join('touch-enabled),('),mod,')','{#modernizr{top:9px;position:absolute}}'].join(''), function( node ) {
            bool = node.offsetTop === 9;
          });
        }

        return bool;
    };
    for ( var feature in tests ) {
        if ( hasOwnProp(tests, feature) ) {
                                    featureName  = feature.toLowerCase();
            Modernizr[featureName] = tests[feature]();

            classes.push((Modernizr[featureName] ? '' : 'no-') + featureName);
        }
    }



     Modernizr.addTest = function ( feature, test ) {
       if ( typeof feature == 'object' ) {
         for ( var key in feature ) {
           if ( hasOwnProp( feature, key ) ) {
             Modernizr.addTest( key, feature[ key ] );
           }
         }
       } else {

         feature = feature.toLowerCase();

         if ( Modernizr[feature] !== undefined ) {
                                              return Modernizr;
         }

         test = typeof test == 'function' ? test() : test;

         if (typeof enableClasses !== "undefined" && enableClasses) {
           docElement.className += ' ' + (test ? '' : 'no-') + feature;
         }
         Modernizr[feature] = test;

       }

       return Modernizr; 
     };


    setCss('');
    modElem = inputElem = null;


    Modernizr._version      = version;

    Modernizr._prefixes     = prefixes;

    Modernizr.mq            = testMediaQuery;
    Modernizr.testStyles    = injectElementWithStyles;
    return Modernizr;

})(this, this.document);
;
/*jshint curly:true, eqeqeq:true, laxbreak:true, noempty:false */
/*

  The MIT License (MIT)

  Copyright (c) 2007-2013 Einar Lielmanis and contributors.

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation files
  (the "Software"), to deal in the Software without restriction,
  including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software,
  and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.


 Style HTML
---------------

  Written by Nochum Sossonko, (nsossonko@hotmail.com)

  Based on code initially developed by: Einar Lielmanis, <einar@jsbeautifier.org>
    http://jsbeautifier.org/

  Usage:
    style_html(html_source);

    style_html(html_source, options);

  The options are:
    indent_inner_html (default false)  — indent <head> and <body> sections,
    indent_size (default 4)          — indentation size,
    indent_char (default space)      — character to indent with,
    wrap_line_length (default 250)            -  maximum amount of characters per line (0 = disable)
    brace_style (default "collapse") - "collapse" | "expand" | "end-expand"
            put braces on the same line as control statements (default), or put braces on own line (Allman / ANSI style), or just put end braces on own line.
    unformatted (defaults to inline tags) - list of tags, that shouldn't be reformatted
    indent_scripts (default normal)  - "keep"|"separate"|"normal"
    preserve_newlines (default true) - whether existing line breaks before elements should be preserved
                                        Only works before elements, not inside tags or for text.
    max_preserve_newlines (default unlimited) - maximum number of line breaks to be preserved in one chunk
    indent_handlebars (default false) - format and indent {{#foo}} and {{/foo}}

    e.g.

    style_html(html_source, {
      'indent_inner_html': false,
      'indent_size': 2,
      'indent_char': ' ',
      'wrap_line_length': 78,
      'brace_style': 'expand',
      'unformatted': ['a', 'sub', 'sup', 'b', 'i', 'u'],
      'preserve_newlines': true,
      'max_preserve_newlines': 5,
      'indent_handlebars': false
    });
*/

(function() {

    function trim(s) {
        return s.replace(/^\s+|\s+$/g, '');
    }

    function ltrim(s) {
        return s.replace(/^\s+/g, '');
    }

    function style_html(html_source, options, js_beautify, css_beautify) {
        //Wrapper function to invoke all the necessary constructors and deal with the output.

        var multi_parser,
            indent_inner_html,
            indent_size,
            indent_character,
            wrap_line_length,
            brace_style,
            unformatted,
            preserve_newlines,
            max_preserve_newlines,
            indent_handlebars;

        options = options || {};

        // backwards compatibility to 1.3.4
        if ((options.wrap_line_length === undefined || parseInt(options.wrap_line_length, 10) === 0) &&
                (options.max_char !== undefined && parseInt(options.max_char, 10) !== 0)) {
            options.wrap_line_length = options.max_char;
        }

        indent_inner_html = options.indent_inner_html || true;
        indent_size = parseInt(options.indent_size || 1, 10);
        indent_character = options.indent_char || '\t';
        brace_style = options.brace_style || 'collapse';
        wrap_line_length =  parseInt(options.wrap_line_length, 10) === 0 ? 32786 : parseInt(options.wrap_line_length || 100000, 10);
        unformatted = options.unformatted || ['a', 'span', 'bdo', 'em', 'strong', 'dfn', 'code', 'samp', 'kbd', 'var', 'cite', 'abbr', 'acronym', 'q', 'sub', 'sup', 'tt', 'i', 'b', 'big', 'small', 'u', 's', 'strike', 'font', 'ins', 'del', 'pre', 'address', 'dt', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        preserve_newlines = options.preserve_newlines || true;
        max_preserve_newlines = preserve_newlines ? parseInt(options.max_preserve_newlines || 32786, 10) : 0;
        indent_handlebars = options.indent_handlebars || true;

        function Parser() {

            this.pos = 0; //Parser position
            this.token = '';
            this.current_mode = 'CONTENT'; //reflects the current Parser mode: TAG/CONTENT
            this.tags = { //An object to hold tags, their position, and their parent-tags, initiated with default values
                parent: 'parent1',
                parentcount: 1,
                parent1: ''
            };
            this.tag_type = '';
            this.token_text = this.last_token = this.last_text = this.token_type = '';
            this.newlines = 0;
            this.indent_content = indent_inner_html;

            this.Utils = { //Uilities made available to the various functions
                whitespace: "\n\r\t ".split(''),
                single_token: 'br,input,link,meta,!doctype,basefont,base,area,hr,wbr,param,img,isindex,?xml,embed,?php,?,?='.split(','), //all the single tags for HTML
                extra_liners: 'head,body,/html'.split(','), //for tags that need a line of whitespace before them
                in_array: function(what, arr) {
                    for (var i = 0; i < arr.length; i++) {
                        if (what === arr[i]) {
                            return true;
                        }
                    }
                    return false;
                }
            };

            this.traverse_whitespace = function() {
                var input_char = '';

                input_char = this.input.charAt(this.pos);
                if (this.Utils.in_array(input_char, this.Utils.whitespace)) {
                    this.newlines = 0;
                    while (this.Utils.in_array(input_char, this.Utils.whitespace)) {
                        if (preserve_newlines && input_char === '\n' && this.newlines <= max_preserve_newlines) {
                            this.newlines += 1;
                        }

                        this.pos++;
                        input_char = this.input.charAt(this.pos);
                    }
                    return true;
                }
                return false;
            };

            this.get_content = function() { //function to capture regular content between tags

                var input_char = '',
                    content = [],
                    space = false; //if a space is needed

                while (this.input.charAt(this.pos) !== '<') {
                    if (this.pos >= this.input.length) {
                        return content.length ? content.join('') : ['', 'TK_EOF'];
                    }

                    if (this.traverse_whitespace()) {
                        if (content.length) {
                            space = true;
                        }
                        continue; //don't want to insert unnecessary space
                    }

                    if (indent_handlebars) {
                        // Handlebars parsing is complicated.
                        // {{#foo}} and {{/foo}} are formatted tags.
                        // {{something}} should get treated as content, except:
                        // {{else}} specifically behaves like {{#if}} and {{/if}}
                        var peek3 = this.input.substr(this.pos, 3);
                        if (peek3 === '{{#' || peek3 === '{{/') {
                            // These are tags and not content.
                            break;
                        } else if (this.input.substr(this.pos, 2) === '{{') {
                            if (this.get_tag(true) === '{{else}}') {
                                break;
                            }
                        }
                    }

                    input_char = this.input.charAt(this.pos);
                    this.pos++;

                    if (space) {
                        if (this.line_char_count >= this.wrap_line_length) { //insert a line when the wrap_line_length is reached
                            this.print_newline(false, content);
                            this.print_indentation(content);
                        } else {
                            this.line_char_count++;
                            content.push(' ');
                        }
                        space = false;
                    }
                    this.line_char_count++;
                    content.push(input_char); //letter at-a-time (or string) inserted to an array
                }
                return content.length ? content.join('') : '';
            };

            this.get_contents_to = function(name) { //get the full content of a script or style to pass to js_beautify
                if (this.pos === this.input.length) {
                    return ['', 'TK_EOF'];
                }
                var input_char = '';
                var content = '';
                var reg_match = new RegExp('</' + name + '\\s*>', 'igm');
                reg_match.lastIndex = this.pos;
                var reg_array = reg_match.exec(this.input);
                var end_script = reg_array ? reg_array.index : this.input.length; //absolute end of script
                if (this.pos < end_script) { //get everything in between the script tags
                    content = this.input.substring(this.pos, end_script);
                    this.pos = end_script;
                }
                return content;
            };

            this.record_tag = function(tag) { //function to record a tag and its parent in this.tags Object
                if (this.tags[tag + 'count']) { //check for the existence of this tag type
                    this.tags[tag + 'count']++;
                    this.tags[tag + this.tags[tag + 'count']] = this.indent_level; //and record the present indent level
                } else { //otherwise initialize this tag type
                    this.tags[tag + 'count'] = 1;
                    this.tags[tag + this.tags[tag + 'count']] = this.indent_level; //and record the present indent level
                }
                this.tags[tag + this.tags[tag + 'count'] + 'parent'] = this.tags.parent; //set the parent (i.e. in the case of a div this.tags.div1parent)
                this.tags.parent = tag + this.tags[tag + 'count']; //and make this the current parent (i.e. in the case of a div 'div1')
            };

            this.retrieve_tag = function(tag) { //function to retrieve the opening tag to the corresponding closer
                if (this.tags[tag + 'count']) { //if the openener is not in the Object we ignore it
                    var temp_parent = this.tags.parent; //check to see if it's a closable tag.
                    while (temp_parent) { //till we reach '' (the initial value);
                        if (tag + this.tags[tag + 'count'] === temp_parent) { //if this is it use it
                            break;
                        }
                        temp_parent = this.tags[temp_parent + 'parent']; //otherwise keep on climbing up the DOM Tree
                    }
                    if (temp_parent) { //if we caught something
                        this.indent_level = this.tags[tag + this.tags[tag + 'count']]; //set the indent_level accordingly
                        this.tags.parent = this.tags[temp_parent + 'parent']; //and set the current parent
                    }
                    delete this.tags[tag + this.tags[tag + 'count'] + 'parent']; //delete the closed tags parent reference...
                    delete this.tags[tag + this.tags[tag + 'count']]; //...and the tag itself
                    if (this.tags[tag + 'count'] === 1) {
                        delete this.tags[tag + 'count'];
                    } else {
                        this.tags[tag + 'count']--;
                    }
                }
            };

            this.indent_to_tag = function(tag) {
                // Match the indentation level to the last use of this tag, but don't remove it.
                if (!this.tags[tag + 'count']) {
                    return;
                }
                var temp_parent = this.tags.parent;
                while (temp_parent) {
                    if (tag + this.tags[tag + 'count'] === temp_parent) {
                        break;
                    }
                    temp_parent = this.tags[temp_parent + 'parent'];
                }
                if (temp_parent) {
                    this.indent_level = this.tags[tag + this.tags[tag + 'count']];
                }
            };

            this.get_tag = function(peek) { //function to get a full tag and parse its type
                var input_char = '',
                    content = [],
                    comment = '',
                    space = false,
                    tag_start, tag_end,
                    tag_start_char,
                    orig_pos = this.pos,
                    orig_line_char_count = this.line_char_count;

                peek = peek !== undefined ? peek : false;

                do {
                    if (this.pos >= this.input.length) {
                        if (peek) {
                            this.pos = orig_pos;
                            this.line_char_count = orig_line_char_count;
                        }
                        return content.length ? content.join('') : ['', 'TK_EOF'];
                    }

                    input_char = this.input.charAt(this.pos);
                    this.pos++;

                    if (this.Utils.in_array(input_char, this.Utils.whitespace)) { //don't want to insert unnecessary space
                        space = true;
                        continue;
                    }

                    if (input_char === "'" || input_char === '"') {
                        input_char += this.get_unformatted(input_char);
                        space = true;

                    }

                    if (input_char === '=') { //no space before =
                        space = false;
                    }

                    if (content.length && content[content.length - 1] !== '=' && input_char !== '>' && space) {
                        //no space after = or before >
                        if (this.line_char_count >= this.wrap_line_length) {
                            this.print_newline(false, content);
                            this.print_indentation(content);
                        } else {
                            content.push(' ');
                            this.line_char_count++;
                        }
                        space = false;
                    }

                    if (indent_handlebars && tag_start_char === '<') {
                        // When inside an angle-bracket tag, put spaces around
                        // handlebars not inside of strings.
                        if ((input_char + this.input.charAt(this.pos)) === '{{') {
                            input_char += this.get_unformatted('}}');
                            if (content.length && content[content.length - 1] !== ' ' && content[content.length - 1] !== '<') {
                                input_char = ' ' + input_char;
                            }
                            space = true;
                        }
                    }

                    if (input_char === '<' && !tag_start_char) {
                        tag_start = this.pos - 1;
                        tag_start_char = '<';
                    }

                    if (indent_handlebars && !tag_start_char) {
                        if (content.length >= 2 && content[content.length - 1] === '{' && content[content.length - 2] == '{') {
                            if (input_char === '#' || input_char === '/') {
                                tag_start = this.pos - 3;
                            } else {
                                tag_start = this.pos - 2;
                            }
                            tag_start_char = '{';
                        }
                    }

                    this.line_char_count++;
                    content.push(input_char); //inserts character at-a-time (or string)

                    if (content[1] && content[1] === '!') { //if we're in a comment, do something special
                        // We treat all comments as literals, even more than preformatted tags
                        // we just look for the appropriate close tag
                        content = [this.get_comment(tag_start)];
                        break;
                    }

                    if (indent_handlebars && tag_start_char === '{' && content.length > 2 && content[content.length - 2] === '}' && content[content.length - 1] === '}') {
                        break;
                    }
                } while (input_char !== '>');

                var tag_complete = content.join('');
                var tag_index;
                var tag_offset;

                if (tag_complete.indexOf(' ') !== -1) { //if there's whitespace, thats where the tag name ends
                    tag_index = tag_complete.indexOf(' ');
                } else if (tag_complete[0] === '{') {
                    tag_index = tag_complete.indexOf('}');
                } else { //otherwise go with the tag ending
                    tag_index = tag_complete.indexOf('>');
                }
                if (tag_complete[0] === '<' || !indent_handlebars) {
                    tag_offset = 1;
                } else {
                    tag_offset = tag_complete[2] === '#' ? 3 : 2;
                }
                var tag_check = tag_complete.substring(tag_offset, tag_index).toLowerCase();
                if (tag_complete.charAt(tag_complete.length - 2) === '/' ||
                    this.Utils.in_array(tag_check, this.Utils.single_token)) { //if this tag name is a single tag type (either in the list or has a closing /)
                    if (!peek) {
                        this.tag_type = 'SINGLE';
                    }
                } else if (indent_handlebars && tag_complete[0] === '{' && tag_check === 'else') {
                    if (!peek) {
                        this.indent_to_tag('if');
                        this.tag_type = 'HANDLEBARS_ELSE';
                        this.indent_content = true;
                        this.traverse_whitespace();
                    }
                } else if (tag_check === 'script') { //for later script handling
                    if (!peek) {
                        this.record_tag(tag_check);
                        this.tag_type = 'SCRIPT';
                    }
                } else if (tag_check === 'style') { //for future style handling (for now it justs uses get_content)
                    if (!peek) {
                        this.record_tag(tag_check);
                        this.tag_type = 'STYLE';
                    }
                } else if (this.is_unformatted(tag_check, unformatted)) { // do not reformat the "unformatted" tags
                    comment = this.get_unformatted('</' + tag_check + '>', tag_complete); //...delegate to get_unformatted function
                    content.push(comment);
                    // Preserve collapsed whitespace either before or after this tag.
                    if (tag_start > 0 && this.Utils.in_array(this.input.charAt(tag_start - 1), this.Utils.whitespace)) {
                        content.splice(0, 0, this.input.charAt(tag_start - 1));
                    }
                    tag_end = this.pos - 1;
                    if (this.Utils.in_array(this.input.charAt(tag_end + 1), this.Utils.whitespace)) {
                        content.push(this.input.charAt(tag_end + 1));
                    }
                    this.tag_type = 'SINGLE';
                } else if (tag_check.charAt(0) === '!') { //peek for <! comment
                    // for comments content is already correct.
                    if (!peek) {
                        this.tag_type = 'SINGLE';
                        this.traverse_whitespace();
                    }
                } else if (!peek) {
                    if (tag_check.charAt(0) === '/') { //this tag is a double tag so check for tag-ending
                        this.retrieve_tag(tag_check.substring(1)); //remove it and all ancestors
                        this.tag_type = 'END';
                        this.traverse_whitespace();
                    } else { //otherwise it's a start-tag
                        this.record_tag(tag_check); //push it on the tag stack
                        if (tag_check.toLowerCase() !== 'html') {
                            this.indent_content = true;
                        }
                        this.tag_type = 'START';

                        // Allow preserving of newlines after a start tag
                        this.traverse_whitespace();
                    }
                    if (this.Utils.in_array(tag_check, this.Utils.extra_liners)) { //check if this double needs an extra line
                        this.print_newline(false, this.output);
                        if (this.output.length && this.output[this.output.length - 2] !== '\n') {
                            this.print_newline(true, this.output);
                        }
                    }
                }

                if (peek) {
                    this.pos = orig_pos;
                    this.line_char_count = orig_line_char_count;
                }

                return content.join(''); //returns fully formatted tag
            };

            this.get_comment = function(start_pos) { //function to return comment content in its entirety
                // this is will have very poor perf, but will work for now.
                var comment = '',
                    delimiter = '>',
                    matched = false;

                this.pos = start_pos;
                input_char = this.input.charAt(this.pos);
                this.pos++;

                while (this.pos <= this.input.length) {
                    comment += input_char;

                    // only need to check for the delimiter if the last chars match
                    if (comment[comment.length - 1] === delimiter[delimiter.length - 1] &&
                        comment.indexOf(delimiter) !== -1) {
                        break;
                    }

                    // only need to search for custom delimiter for the first few characters
                    if (!matched && comment.length < 10) {
                        if (comment.indexOf('<![if') === 0) { //peek for <![if conditional comment
                            delimiter = '<![endif]>';
                            matched = true;
                        } else if (comment.indexOf('<![cdata[') === 0) { //if it's a <[cdata[ comment...
                            delimiter = ']]>';
                            matched = true;
                        } else if (comment.indexOf('<![') === 0) { // some other ![ comment? ...
                            delimiter = ']>';
                            matched = true;
                        } else if (comment.indexOf('<!--') === 0) { // <!-- comment ...
                            delimiter = '-->';
                            matched = true;
                        }
                    }

                    input_char = this.input.charAt(this.pos);
                    this.pos++;
                }

                return comment;
            };

            this.get_unformatted = function(delimiter, orig_tag) { //function to return unformatted content in its entirety

                if (orig_tag && orig_tag.toLowerCase().indexOf(delimiter) !== -1) {
                    return '';
                }
                var input_char = '';
                var content = '';
                var min_index = 0;
                var space = true;
                do {

                    if (this.pos >= this.input.length) {
                        return content;
                    }

                    input_char = this.input.charAt(this.pos);
                    this.pos++;

                    if (this.Utils.in_array(input_char, this.Utils.whitespace)) {
                        if (!space) {
                            this.line_char_count--;
                            continue;
                        }
                        if (input_char === '\n' || input_char === '\r') {
                            content += '\n';
                            /*  Don't change tab indention for unformatted blocks.  If using code for html editing, this will greatly affect <pre> tags if they are specified in the 'unformatted array'
                for (var i=0; i<this.indent_level; i++) {
                  content += this.indent_string;
                }
                space = false; //...and make sure other indentation is erased
                */
                            this.line_char_count = 0;
                            continue;
                        }
                    }
                    content += input_char;
                    this.line_char_count++;
                    space = true;

                    if (indent_handlebars && input_char === '{' && content.length && content[content.length - 2] === '{') {
                        // Handlebars expressions in strings should also be unformatted.
                        content += this.get_unformatted('}}');
                        // These expressions are opaque.  Ignore delimiters found in them.
                        min_index = content.length;
                    }
                } while (content.toLowerCase().indexOf(delimiter, min_index) === -1);
                return content;
            };

            this.get_token = function() { //initial handler for token-retrieval
                var token;

                if (this.last_token === 'TK_TAG_SCRIPT' || this.last_token === 'TK_TAG_STYLE') { //check if we need to format javascript
                    var type = this.last_token.substr(7);
                    token = this.get_contents_to(type);
                    if (typeof token !== 'string') {
                        return token;
                    }
                    return [token, 'TK_' + type];
                }
                if (this.current_mode === 'CONTENT') {
                    token = this.get_content();
                    if (typeof token !== 'string') {
                        return token;
                    } else {
                        return [token, 'TK_CONTENT'];
                    }
                }

                if (this.current_mode === 'TAG') {
                    token = this.get_tag();
                    if (typeof token !== 'string') {
                        return token;
                    } else {
                        var tag_name_type = 'TK_TAG_' + this.tag_type;
                        return [token, tag_name_type];
                    }
                }
            };

            this.get_full_indent = function(level) {
                level = this.indent_level + level || 0;
                if (level < 1) {
                    return '';
                }

                return Array(level + 1).join(this.indent_string);
            };

            this.is_unformatted = function(tag_check, unformatted) {
                //is this an HTML5 block-level link?
                if (!this.Utils.in_array(tag_check, unformatted)) {
                    return false;
                }

                if (tag_check.toLowerCase() !== 'a' || !this.Utils.in_array('a', unformatted)) {
                    return true;
                }

                //at this point we have an  tag; is its first child something we want to remain
                //unformatted?
                var next_tag = this.get_tag(true /* peek. */ );

                // test next_tag to see if it is just html tag (no external content)
                var tag = (next_tag || "").match(/^\s*<\s*\/?([a-z]*)\s*[^>]*>\s*$/);

                // if next_tag comes back but is not an isolated tag, then
                // let's treat the 'a' tag as having content
                // and respect the unformatted option
                if (!tag || this.Utils.in_array(tag, unformatted)) {
                    return true;
                } else {
                    return false;
                }
            };

            this.printer = function(js_source, indent_character, indent_size, wrap_line_length, brace_style) { //handles input/output and some other printing functions

                this.input = js_source || ''; //gets the input for the Parser
                this.output = [];
                this.indent_character = indent_character;
                this.indent_string = '';
                this.indent_size = indent_size;
                this.brace_style = brace_style;
                this.indent_level = 0;
                this.wrap_line_length = wrap_line_length;
                this.line_char_count = 0; //count to see if wrap_line_length was exceeded

                for (var i = 0; i < this.indent_size; i++) {
                    this.indent_string += this.indent_character;
                }

                this.print_newline = function(force, arr) {
                    this.line_char_count = 0;
                    if (!arr || !arr.length) {
                        return;
                    }
                    if (force || (arr[arr.length - 1] !== '\n')) { //we might want the extra line
                        arr.push('\n');
                    }
                };

                this.print_indentation = function(arr) {
                    for (var i = 0; i < this.indent_level; i++) {
                        arr.push(this.indent_string);
                        this.line_char_count += this.indent_string.length;
                    }
                };

                this.print_token = function(text) {
                    if (text || text !== '') {
                        if (this.output.length && this.output[this.output.length - 1] === '\n') {
                            this.print_indentation(this.output);
                            text = ltrim(text);
                        }
                    }
                    this.print_token_raw(text);
                };

                this.print_token_raw = function(text) {
                    if (text && text !== '') {
                        if (text.length > 1 && text[text.length - 1] === '\n') {
                            // unformatted tags can grab newlines as their last character
                            this.output.push(text.slice(0, -1));
                            this.print_newline(false, this.output);
                        } else {
                            this.output.push(text);
                        }
                    }

                    for (var n = 0; n < this.newlines; n++) {
                        this.print_newline(n > 0, this.output);
                    }
                    this.newlines = 0;
                };

                this.indent = function() {
                    this.indent_level++;
                };

                this.unindent = function() {
                    if (this.indent_level > 0) {
                        this.indent_level--;
                    }
                };
            };
            return this;
        }

        /*_____________________--------------------_____________________*/

        multi_parser = new Parser(); //wrapping functions Parser
        multi_parser.printer(html_source, indent_character, indent_size, wrap_line_length, brace_style); //initialize starting values

        while (true) {
            var t = multi_parser.get_token();
            multi_parser.token_text = t[0];
            multi_parser.token_type = t[1];

            if (multi_parser.token_type === 'TK_EOF') {
                break;
            }

            switch (multi_parser.token_type) {
                case 'TK_TAG_START':
                    multi_parser.print_newline(false, multi_parser.output);
                    multi_parser.print_token(multi_parser.token_text);
                    if (multi_parser.indent_content) {
                        multi_parser.indent();
                        multi_parser.indent_content = false;
                    }
                    multi_parser.current_mode = 'CONTENT';
                    break;
                case 'TK_TAG_STYLE':
                case 'TK_TAG_SCRIPT':
                    multi_parser.print_newline(false, multi_parser.output);
                    multi_parser.print_token(multi_parser.token_text);
                    multi_parser.current_mode = 'CONTENT';
                    break;
                case 'TK_TAG_END':
                    //Print new line only if the tag has no content and has child
                    if (multi_parser.last_token === 'TK_CONTENT' && multi_parser.last_text === '') {
                        var tag_name = multi_parser.token_text.match(/\w+/)[0];
                        var tag_extracted_from_last_output = null;
                        if (multi_parser.output.length) {
                            tag_extracted_from_last_output = multi_parser.output[multi_parser.output.length - 1].match(/(?:<|{{#)\s*(\w+)/);
                        }
                        if (tag_extracted_from_last_output === null ||
                            tag_extracted_from_last_output[1] !== tag_name) {
                            multi_parser.print_newline(false, multi_parser.output);
                        }
                    }
                    multi_parser.print_token(multi_parser.token_text);
                    multi_parser.current_mode = 'CONTENT';
                    break;
                case 'TK_TAG_SINGLE':
                    // Don't add a newline before elements that should remain unformatted.
                    var tag_check = multi_parser.token_text.match(/^\s*<([a-z]+)/i);
                    if (!tag_check || !multi_parser.Utils.in_array(tag_check[1], unformatted)) {
                        multi_parser.print_newline(false, multi_parser.output);
                    }
                    multi_parser.print_token(multi_parser.token_text);
                    multi_parser.current_mode = 'CONTENT';
                    break;
                case 'TK_TAG_HANDLEBARS_ELSE':
                    multi_parser.print_token(multi_parser.token_text);
                    if (multi_parser.indent_content) {
                        multi_parser.indent();
                        multi_parser.indent_content = false;
                    }
                    multi_parser.current_mode = 'CONTENT';
                    break;
                case 'TK_CONTENT':
                    multi_parser.print_token(multi_parser.token_text);
                    multi_parser.current_mode = 'TAG';
                    break;
                case 'TK_STYLE':
                case 'TK_SCRIPT':
                    if (multi_parser.token_text !== '') {
                        multi_parser.print_newline(false, multi_parser.output);
                        var text = multi_parser.token_text,
                            _beautifier,
                            script_indent_level = 1;
                        if (multi_parser.token_type === 'TK_SCRIPT') {
                            _beautifier = typeof js_beautify === 'function' && js_beautify;
                        } else if (multi_parser.token_type === 'TK_STYLE') {
                            _beautifier = typeof css_beautify === 'function' && css_beautify;
                        }

                        if (options.indent_scripts === "keep") {
                            script_indent_level = 0;
                        } else if (options.indent_scripts === "separate") {
                            script_indent_level = -multi_parser.indent_level;
                        }

                        var indentation = multi_parser.get_full_indent(script_indent_level);
                        if (_beautifier) {
                            // call the Beautifier if avaliable
                            text = _beautifier(text.replace(/^\s*/, indentation), options);
                        } else {
                            // simply indent the string otherwise
                            var white = text.match(/^\s*/)[0];
                            var _level = white.match(/[^\n\r]*$/)[0].split(multi_parser.indent_string).length - 1;
                            var reindent = multi_parser.get_full_indent(script_indent_level - _level);
                            text = text.replace(/^\s*/, indentation)
                                .replace(/\r\n|\r|\n/g, '\n' + reindent)
                                .replace(/\s+$/, '');
                        }
                        if (text) {
                            multi_parser.print_token_raw(indentation + trim(text));
                            multi_parser.print_newline(false, multi_parser.output);
                        }
                    }
                    multi_parser.current_mode = 'TAG';
                    break;
            }
            multi_parser.last_token = multi_parser.token_type;
            multi_parser.last_text = multi_parser.token_text;
        }
        return multi_parser.output.join('');
    }

    if (typeof define === "function" && define.amd) {
        // Add support for require.js
        define(["./beautify", "./beautify-css"], function(js_beautify, css_beautify) {
            return {
              html_beautify: function(html_source, options) {
                return style_html(html_source, options, js_beautify, css_beautify);
              }
            };
        });
    } else if (typeof exports !== "undefined") {
        // Add support for CommonJS. Just put this file somewhere on your require.paths
        // and you will be able to `var html_beautify = require("beautify").html_beautify`.
        var js_beautify = require('./beautify.js').js_beautify;
        var css_beautify = require('./beautify-css.js').css_beautify;

        exports.html_beautify = function(html_source, options) {
            return style_html(html_source, options, js_beautify, css_beautify);
        };
    } else if (typeof window !== "undefined") {
        // If we're running a web page and don't have either of the above, add our one global
        window.html_beautify = function(html_source, options) {
            return style_html(html_source, options, window.js_beautify, window.css_beautify);
        };
    } else if (typeof global !== "undefined") {
        // If we don't even have window, try global.
        global.html_beautify = function(html_source, options) {
            return style_html(html_source, options, global.js_beautify, global.css_beautify);
        };
    }

}());