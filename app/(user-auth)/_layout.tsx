
const WelcomePage= ({onGetStarted}) => {
    return(
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome!</h1>
                <p className="text-gray-600 mb-8">Get started by loggin in or creating an account.</p>
                <button onClick={onGetStarted}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-lg front-semibold hover:bg-indigo-700 transition-colors shadow-lg">
                            Get Started
                        </button>
            </div>
        </div>
    );
};

export default WelcomePage;