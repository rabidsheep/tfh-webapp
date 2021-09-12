
/**
 * for functions that would be useful to components
 * requiring user authentication
 */

 export default {
    data: () => {
        return {
            uid: null,
            isAdmin: false,
            isRegistered: true,
            loggingIn: false,
            allowLogin: false,
        }
    },
    methods: {
        test2() {
            console.log("test2")
        },
        
        // auth state watcher
        watchAuthState() {
            this.$firebase.auth().onAuthStateChanged((user) => {
                if (!user) {
                    this.uid = null;
                    this.step = 1;
                    this.allowLogin = true;

                    return console.log('User not found');
                } else {
                    this.loggingIn = true;
                    this.uid = user.uid;

                    let loginRef = null;

                    if (this.$dev) {
                        console.log("Dev Environment");

                        loginRef = this.$users.get({ uid: user.uid });
                    } else {
                        console.log("Production Environment");

                        loginRef = this.setAuthToken()
                        .then(() => {
                            console.log('Checking user');
                            return this.$users.get({ uid: user.uid });
                        });
                    };

                    loginRef.then((response) => {
                        let userData = response.body[0];

                        if (userData) {
                            console.log("Retrieved user data");
                            this.isAdmin = userData.admin;
                        } else {
                            console.log("Creating new user");

                            this.isRegistered = false;

                            let newUser = {
                                uid: user.uid,
                                email: user.email,
                                admin: false
                            };

                            return this.$users.save(newUser)
                            .then(() => console.log('User created'));
                        };
                    })
                    .then(() => {
                        this.loading = false;
                        this.loadingMatches = true;
                        this.isRegistered = true;
                        this.loggingIn = false;
                        this.step = 2;
                        
                        if (this.$route.path === '/edit')
                            this.getMatches(this.$route.query.uploadId);
                    })
                    .catch((error) => {

                        this.loading = false;
                        this.isRegistered = true;
                        this.loggingIn = false;
                        this.step = 1;
                        this.allowLogin = true;
                        console.log(error);
                    });
                };
            });
        },

        signIn(providerName) {
            this.loading = true
            this.allowLogin = false
            this.$firebase.auth()
            .signInWithPopup(this.$providers[providerName])
            .then(() => {
                this.loading = false
            })
            .catch((error) => {
                console.log(error)
                this.allowLogin = true
                this.loading = false
            })
        },

        setAuthToken() {
            return this.$firebase.auth().currentUser.getIdToken()
                .then((token) => {
                    console.log('Setting auth token')
                    return this.$httpInterceptors.push((request) => {
                        request.headers.set('Authorization', token)
                    })
                })
                .catch((error) => console.log(error))
        },
    }
}