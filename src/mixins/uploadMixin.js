
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