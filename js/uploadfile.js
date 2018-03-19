(function ($) {
    var Uploadfile = function (el, option) {
        this.$this = $(el);
        this.default = option;
        this.loadfilecount = 0;
        this.clickfilecount = 0;
        // this.attachmentcount = 0;
        this.allfilecount = 0;
        this.currentfiles = [];
        this.loaddata = [];
        this.disable = false;
        this.initbody();
        if (this.default.button != null) {
            this.onclickbtn();
        }
    };
    Uploadfile.DEFAULT = {
        title: "上传",
        button: null,
        collenght: 2,
        text: "浏览",
        formid: "",
        filename: null,//post 后台api接收区分文件分类参数
        filenumber: 0,
        allowedFileExtensions: null,//['jpg', 'gif', 'png', 'pdf']接收的文件后缀
        filedata: null,
        isclickadd: true,
        deletefile: function (data, obj, removecallback) {
            return {};
        },
        submitfile: function (formdata) {
            return {};
        }
    }
    Uploadfile.prototype.load = function (data) {
        if (data == null) {
            return;
        }
        if (data.length > 0) {
            this.$this.find(".filelist").html('');
            this.loadfilecount += data.length;
            this.allfilecount += data.length;
            this.loaddata = data;
            this.loadfile(data, false);
        }
    }
    Uploadfile.prototype.delete = function (loadfiledelete) {
        this.default.deletefile = loadfiledelete;
    }
    Uploadfile.prototype.initbody = function () {
        var randomnumber = Math.random();
        var self = this;
        var html = '<div class="form-group   inputfile clearfix"><label class="col-sm-' + this.default.collenght + ' control-label form-label label-attachment">{0}</label>' +
            '     <div class="input-group-btn" style="float: left;">' +
            '       <div tabindex="500"  class="btn btn-default btn-file input-file fileclick">' +
            '      <i class="glyphicon glyphicon-folder-open"></i>&nbsp;' +
            '                       <span class="hidden-xs"  >{1}</span>' +
            '                 </div>' +
            '       </div>' +
            //'    <div id="AttachmentCountDiv" class="left showfileslable">' +
            //'       (当前新增<span id="AttachmentCount"></span>个附件)' +
            //'     </div>' +
            '    <div id="SwitchAttachmentDiv"  class="switch-attachment showfileslable right" style="display:none"></label>' +
            '      <input type="checkbox" id="showfiles_' + randomnumber + '"   class="checked_Effect" checked="checked" />' +
            '       <label id="SwitchAttachment"   for="showfiles_' + randomnumber + '" >' +
            '    </div></div>' +

            '<div id="AttachmentDiv" class="form-group images clearfix" >' +
            '  <label class="col-sm-' + this.default.collenght + ' control-label form-label" ></label >' +
            '   <div class="col-sm-' + (12 - this.default.collenght) + '" > ' +
            '   <div class="filelist clearfix" style="border:1px solid #ccc;" > ' +

            '      </div> ' +
            '      </div> ' +
            '        </div>';
        this.$this.html(html.format(this.default.title, this.default.text));
        this.createfileinput();
        //$(".showfileslable").fadeOut();
        this.$this.find(".fileclick").off("click").on("click", function () {
            self.$this.find("input[type='file']").click();
        })
        this.$this.find("input[type='checkbox']").on("click", function () {
            if ($(this).is(":checked")) {
                self.$this.find("#AttachmentDiv").slideDown();
            }
            else {
                self.$this.find("#AttachmentDiv").slideUp();
            }
        })

    }
    Uploadfile.prototype.createfileinput = function () {
        var self = this;
        var fileinput = '<input  name="uploadfileinput" type="file" multiple="multiple" class="file" style="display:none" />';
        this.$this.append(fileinput);
        this.$this.find("input[type='file']").on("change", function () {
            self.clickfile(this);
        })
    }
    Uploadfile.prototype.clearfileinput = function () {
        this.$this.find("input[type='file']").remove();
    }
    Uploadfile.prototype.onclickbtn = function () {
        var self = this;
        $(this.default.button).off("click").on("click", function () {
            var formdata = self.getformdata();
            self.default.submitfile(formdata);
        })
    }
    Uploadfile.prototype.checkedfilenumber = function () {
        var result = true;
        if (this.default.filenumber > 0) {
            if (this.allfilecount == this.default.filenumber) {
                result = false;
            }
        }
        return result;
    }
    Uploadfile.prototype.clickfile = function (file) {
        var self = this;
        if (file.files.length > 0) {
            if (!this.default.isclickadd) {
                this.removeallfiles();
                this.currentfiles = [];
                this.allfilecount = this.loadfilecount;
            }
            this.isclickLoadfile(file);
            $.each(file.files, function (k, v) {
                var selffile = this;
                var obj = new Object();
                var files = [];
                var i = Math.floor(Math.log(v.size) / Math.log(1024));
                var sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
                var reader = new FileReader();
                reader.readAsDataURL(v);
                reader.onload = function (theFile) {
                    var filename = v.name;
                    var fileext = filename.split('.');
                    if (self.isextension(fileext[fileext.length - 1]) && !self.ishasclickfile(filename)) {
                        // self.attachmentcount++;
                        obj.Name = filename;
                        var imgbases = theFile.target.result.split(",");
                        obj.Base64Stream = imgbases[1];
                        obj.ID = 0;
                        obj.SizeDisplay = (v.size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + sizes[i];
                        obj.Size = v.size;
                        files.push(obj);
                        if (self.checkedfilenumber()) {
                            self.allfilecount++;
                            self.loadfile(files, true);
                            self.currentfiles.push(selffile);
                        }
                        else {
                            sweetAlert("警告", "当前文件仅支持上传" + self.default.filenumber + "个文件,多余文件已过滤", "warning");
                        }
                    }
                }
            });
        }
    }
    Uploadfile.prototype.ishasclickfile = function (filename) {
        var result = false;
        if (this.currentfiles.length > 0) {
            for (var i = 0; i < this.currentfiles.length; i++) {
                if (this.currentfiles[i].name === filename) {
                    result = true;
                }
            }
        }
        return result
    }

    Uploadfile.prototype.isclickLoadfile = function (file) {
        var self = this;
        var NotFileExtensionsFile = true;
        var HasFileExtensionsFile = false;
        if (this.default.allowedFileExtensions != null) {
            $.each(file.files, function (k, v) {
                var filename = v.name;
                var fileext = filename.split('.');
                if (self.isextension(fileext[fileext.length - 1])) {
                    HasFileExtensionsFile = true;
                }
                else {
                    NotFileExtensionsFile = false;
                    //self.removecurrentfiles(self.clickfilecount);
                }
                //  self.clickfilecount++;
            });
            if (!NotFileExtensionsFile) {
                sweetAlert("警告", "当前文件仅支持" + this.default.allowedFileExtensions.join(",") + "格式上传,其他格式已过滤", "warning");
            }
        }
        return HasFileExtensionsFile;
    }


    Uploadfile.prototype.isextension = function (ext) {
        var result = false;
        if (this.default.allowedFileExtensions != null) {
            for (var i = 0; i < this.default.allowedFileExtensions.length; i++) {
                if (this.default.allowedFileExtensions[i].trim() == ext.toLowerCase().trim()) {
                    result = true;
                }
            }
        }
        else {
            result = true;
        }
        return result;
    }
    Uploadfile.prototype.getimghtml = function (filename, fileurl) {
        var strhtml = '';
        var filearry = filename.split(".");
        var ext = filearry[filearry.length - 1];
        if (ext == "doc" || ext == "docx") {
            strhtml += '<img src="images/word.png" class="file-preview-image kv-preview-data" onclick="ImgMagnifying(this)" title= "' + filename + '" alt= "' + filename + '" style= "width:auto;height:40px;max-width:80px;" >';

        }
        else if (ext == "xls" || ext == "xlsx") {
            strhtml += '<img src="images/excel.png" class="file-preview-image kv-preview-data" onclick="ImgMagnifying(this)" title= "' + filename + '" alt= "' + filename + '" style= "width:auto;height:40px;max-width:80px;" >';

        }
        else if (ext == "ppt" || ext == "pptx") {
            strhtml += '<img src="images/ppt.png" class="file-preview-image kv-preview-data" onclick="ImgMagnifying(this)" title= "' + filename + '" alt= "' + filename + '" style= "width:auto;height:40px;max-width:80px;" >';
        }
        else if (ext == "pdf") {
            strhtml += '<img src="images/pdf.png" class="file-preview-image kv-preview-data" onclick="ImgMagnifying(this)" title= "' + filename + '" alt= "' + filename + '" style= "width:auto;height:40px;max-width:80px;" >';
        }
        else {
            strhtml += '<img src="data:image/png;base64,';
            strhtml += '' + fileurl + '"';
            strhtml += 'class="file-preview-image kv-preview-data" onclick="ImgMagnifying(this)" title= "' + filename + '" alt= "' + filename + '" style= "width:auto;height:40px;max-width:80px;" >';
        }
        return strhtml
    }

    Uploadfile.prototype.refresh = function () {
        this.clearfileinput();//清除文件
        this.createfileinput();//重新生成文件
        this.$this.find(".filelist").html('');
        this.currentfiles = [];
        this.$this.find(".showfileslable").fadeOut();
        this.$this.find("#AttachmentDiv").slideUp();

    }

    Uploadfile.prototype.addfilesinformdata = function (formdata) {
        if (this.currentfiles.length > 0) {
            for (var i = 0; i < this.currentfiles.length; i++) {
                if (this.default.filename == null) {
                    formdata.append(this.currentfiles[i].name, this.currentfiles[i]);
                }
                else {
                    formdata.append(this.default.filename, this.currentfiles[i]);
                }
            }
        }
        return formdata;
    }

    Uploadfile.prototype.getfiledata = function () {
        return this.currentfiles;
    }

    Uploadfile.prototype.getformdata = function () {
        var form = document.getElementById(this.default.formid);
        var formdata = new FormData();
        if (form != null) {
            var tagElements = form.getElementsByTagName('input');
            for (var j = 0; j < tagElements.length; j++) {
                formdata.append(tagElements[j].name, tagElements[j].value);
            }
            var tagElement_textareas = form.getElementsByTagName('textarea');
            for (var j = 0; j < tagElement_textareas.length; j++) {
                formdata.append(tagElement_textareas[j].name, tagElement_textareas[j].value);
            }

            var tagElement_select = form.getElementsByTagName('select');
            for (var j = 0; j < tagElement_select.length; j++) {
                formdata.append(tagElement_select[j].name, tagElement_select[j].value);
            }
            if (this.currentfiles.length > 0) {
                for (var i = 0; i < this.currentfiles.length; i++) {
                    if (this.default.filename == null) {
                        formdata.append(this.currentfiles[i].name, this.currentfiles[i]);
                    }
                    else {
                        formdata.append(this.default.filename, this.currentfiles[i]);
                    }
                }
            }
        }
        return formdata;

    }
    Uploadfile.prototype.loadfile = function (data, isclickfile) {
        var self = this;
        if (data != null && data.length != 0) {
            this.$this.find(".showfileslable").fadeIn();
            for (var i = 0; i < data.length; i++) {
                var strhtml;
                var docver = data[i].Name;
                strhtml = '<div class="file-preview-frame krajee-default  kv-preview-thumb"  onmouseover="frameover(this)" onmouseout="frameout(this)" id="preview-1497597237748-' + i + '" data-fileindex="' + i + '" data-template="image"><div class="kv-file-content">';
                strhtml += this.getimghtml(docver, data[i].Base64Stream);
                strhtml += '</div><div class="file-thumbnail-footer"><div class="file-footer-caption" title="' + docver + '">' + docver + '<br> <samp>(' + data[i].SizeDisplay + ')</samp></div>';
                strhtml += ' <div class="file-actions">  <div class="file-footer-buttons">';
                var btnclass = '';
                if (!isclickfile) {
                    btnclass = 'kv-file-remove '
                }
                else {
                    //this.createfileinput();
                    btnclass = 'kv-click-file-remove  removefile_click_' + i + ''
                }
                strhtml += ' <a  href="javascript:;" data-index="' + (this.currentfiles.length + i) + '"  data-isclickfile="' + isclickfile + '" class="' + btnclass + ' " style="color:#fff;text-decoration:none;" title="删除文件" > <i class="glyphicon glyphicon-trash"></i>删除</a > ';
                strhtml += '</div> <div class="clearfix"></div> </div></div></div>';
                this.$this.find(".filelist").append(strhtml);
                this.$this.find("#AttachmentDiv").slideDown();
                this.$this.find("input[type='checkbox']").prop("checked", true);
                if (!isclickfile) {
                    this.$this.find("a.kv-file-remove").off("click").on("click", function () {
                        var index = $(this).data("index");
                        if (!self.disable) {
                            self.default.deletefile(self.loaddata[index], this, self.removefile);
                        }
                    })
                }
                else {
                    this.$this.find("a.kv-click-file-remove").off("click").on("click", function () {
                        self.removefile(this);
                    })
                }
            }
            //  $("#AttachmentCount").html(this.attachmentcount);
            // this.loadfilecount++;
        }
    }
    Uploadfile.prototype.removeallfiles = function () {
        if (this.currentfiles.length > 0) {
            // this.attachmentcount = 0;
            //this.loadfilecount = 0;
            for (var i = 0; i < this.currentfiles.length; i++) {
                this.$this.find(".removefile_click_" + i).parents(".kv-preview-thumb").remove();
            }
        }
    }
    Uploadfile.prototype.removecurrentfiles = function (index) {
        var removefiles = [];
        for (var i = 0; i < this.currentfiles.length; i++) {
            if (i != index) {
                removefiles.push(this.currentfiles[i])
            }
        }
        this.currentfiles = removefiles;
    }
    Uploadfile.prototype.removefile = function (event) {
        var isclickfile = $(event).data("isclickfile");
        if (isclickfile) {
            // this.attachmentcount--;
            var index = $(event).data("index");
            this.removecurrentfiles(index);
            //$("#AttachmentCount").html(this.attachmentcount);
            //  filecount = this.attachmentcount;
        }
        this.allfilecount--;
        if (this.allfilecount == 0) {
            this.$this.find(".showfileslable").fadeOut();
            this.$this.find("#AttachmentDiv").slideUp();
        }
        $(event).parents(".kv-preview-thumb").remove();
    }
    Uploadfile.prototype.disabled = function (disable) {
        this.disable = disable;
        if (this.disable) {
            this.$this.find("input[type='file']").attr("disabled", "disabled");       
        }
        else {
            this.$this.find("input[type='file']").removeAttr("disabled");
            
        }
    }


    var uploadfileallowedMethods = ["getformdata", "refresh", "getfiledata", "load", "delete", "addfilesinformdata", "disabled"];

    $.fn.uploadfile = function (option) {
        var value, args = Array.prototype.slice.call(arguments, 1);
        var data;
        this.each(function () {
            data = $(this).data("uploadfile");
            var uploadfiledefault;
            if (!data) {
                uploadfiledefault = $.extend({}, Uploadfile.DEFAULT, option);
                $(this).data("uploadfile", (data = new Uploadfile(this, uploadfiledefault)));
            }
            else {
                if (typeof option == "string") {
                    if ($.inArray(option, uploadfileallowedMethods) < 0) {
                        throw new Error("Unknown method: " + option);
                    }
                    if (!data) {
                        return;
                    }
                    value = data[option].apply(data, args);
                }
            }
        })
        return typeof value === 'undefined' ? this : value;
    };

})(jQuery)


function frameover(obj) {
    $frame = $(obj);
    $frame.find(".file-actions").show();
}

function frameout(obj) {
    $frame = $(obj);
    $frame.find(".file-actions").hide();
}