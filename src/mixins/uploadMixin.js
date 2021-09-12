
/**
 * for functions that would be useful to components
 * requiring user authentication
 */
 export default {
    data: () => {
        return {
            loading: false,
            valid: false,
            error: false,
            errors: [],
            warning: false,
            uploading: false,
            finished: false,
            currentDate: new Date().toISOString().split('T').toString(),
            fileData: null,
            formData: null,
            tempData: null,
            datepicker: false,
            hasVideo: false,
            changeButton: false,

            
            date: null,
            group: {
                title: null,
                part: null,
                date: null,
            },
            
            url: null,
            video: {},
            channel: {},
            vid: null,
        }
    },
    methods: {
        /** generates reader for each file */
        readFiles(files, i) {
            (function (that, files, i) {
                var file = files[i];

                new Promise(function(resolve, reject) {
                    // check file extension and duplicate issues first
                    if (file.name.substring(file.name.length - 5, file.name.length) !== '.tfhr') {
                        that.setErrors('extension', file.name);
                        reject("File" + file.name + " does not end in a valid TFHR file extension.");
                    } else if (that.matches.find(m => m.file.name === file.name)) {
                        that.setErrors('duplicate', file.name);
                        reject("File " + file.name + " already exists.");
                    } else {
                        // read hex code of file to retrieve timestamp
                        var hexReader = new FileReader();

                        hexReader.onload = function(e) {
                            let hex = that.buf2hex(e.target.result);
                            let hexTime = hex?.match(/.{1,2}/g)?.reverse().join('');
                            let timestamp = new Date(parseInt(hexTime, 16) * 1000)?.toISOString()?.split('T');

                            if (!timestamp) {
                                that.setErrors('parse', file.name);
                                reject("Could not retrieve file timestamp from " + file.name);
                            } else {
                                resolve(timestamp[0]);
                            };
                        };

                        hexReader.readAsArrayBuffer(file);
                    };
                }).then((timestamp) => {
                    // read file as text for rest of data
                    var textReader = new FileReader();

                    textReader.onload = function(e) {
                        that.parseFileData(e.target.result, file, timestamp, i, files.length - 1);
                    }

                    textReader.readAsText(file);
                })
                .then(() => {
                    if (i < files.length - 1)
                        that.readFiles(files, i + 1);
                })
                .catch((error) => {
                    console.log(error);
                    if (i < files.length - 1)
                        that.readFiles(files, i + 1);
                    else
                        if (that.errors.length > 0)
                            that.error = true;
                })
            })(this, files, i);
        },

        /** converts array buffer to string */
        buf2hex(buffer) {
            let buf = [...new Uint8Array(buffer)];

            if (buf.length < 154) return null;

            let timestamp = buf.slice(150, 154);
            return timestamp.map(x => x.toString(16).padStart(2, '0')).join('');
        },

        
        /** sets errors array for display once files finish being read */
        setErrors(type, file) {
            let index = this.errors.findIndex(e => e.type == type);

            if (index === -1) {
                if (!file) {
                    console.log("Adding error type to array");
                    this.errors.push({type: type});
                } else {
                    console.log("Adding error type + file name to array");
                    this.errors.push({type: type, files: [file]});
                }
            } else if (file) {
                console.log("Adding file name to " + type + " file array");
                this.errors[index].files.push(file);
            };
        },

        /** clears errors array */
        clearErrors() {
            this.errors = [];
            this.error = false;
        },
        
         
        validateForm() {
            const refs = this.$refs;
            window.setTimeout(function () {
                refs.form.validate();
            }, 100);
        }
    }
}