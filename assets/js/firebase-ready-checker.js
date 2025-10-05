// Firebase Ready Check - Robust initialization helper
// This script ensures Firebase is properly loaded before proceeding

window.FirebaseReadyChecker = {
    maxAttempts: 30, // 30 attempts = 15 seconds max
    attemptInterval: 500, // 500ms between attempts
    currentAttempt: 0,
    
    async waitForFirebase() {
        return new Promise((resolve, reject) => {
            console.log('🔍 FirebaseReadyChecker: Starting Firebase availability check...');
            
            const check = () => {
                this.currentAttempt++;
                
                // Check 1: Firebase SDK loaded
                if (typeof firebase === 'undefined') {
                    console.log(`🔍 Attempt ${this.currentAttempt}: Firebase SDK not loaded yet`);
                    return this.scheduleNextCheck(resolve, reject);
                }
                
                // Check 2: Firebase app initialized
                if (!firebase.apps || firebase.apps.length === 0) {
                    console.log(`🔍 Attempt ${this.currentAttempt}: Firebase app not initialized yet`);
                    return this.scheduleNextCheck(resolve, reject);
                }
                
                // Check 3: Global Firebase services available
                if (!window.db || !window.auth) {
                    console.log(`🔍 Attempt ${this.currentAttempt}: Firebase services not ready yet (db: ${!!window.db}, auth: ${!!window.auth})`);
                    return this.scheduleNextCheck(resolve, reject);
                }
                
                // Success!
                console.log('✅ FirebaseReadyChecker: Firebase is ready!');
                console.log('📊 Firebase Status:', {
                    sdkLoaded: typeof firebase !== 'undefined',
                    appsCount: firebase.apps ? firebase.apps.length : 0,
                    dbReady: !!window.db,
                    authReady: !!window.auth,
                    attemptsUsed: this.currentAttempt
                });
                
                resolve(true);
            };
            
            // Start checking
            check();
        });
    },
    
    scheduleNextCheck(resolve, reject) {
        if (this.currentAttempt >= this.maxAttempts) {
            const errorMsg = `Firebase not ready after ${this.currentAttempt} attempts (${this.currentAttempt * this.attemptInterval}ms)`;
            console.error('❌ FirebaseReadyChecker:', errorMsg);
            reject(new Error(errorMsg));
            return;
        }
        
        setTimeout(() => {
            this.waitForFirebase().then(resolve).catch(reject);
        }, this.attemptInterval);
    }
};

// Make it available globally
console.log('🚀 FirebaseReadyChecker loaded and ready');