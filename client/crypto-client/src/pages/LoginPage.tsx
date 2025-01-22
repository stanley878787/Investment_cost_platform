// src/pages/LoginPage.tsx
import React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

// 客製化css
import '../css/LoginPage.css';
import '../css/bootstrap.min.css';
import '../css/style.css';

// 客製化JS
import '../js/jquery.min.js';
import '../js/bootstrap.min.js';
import '../js/main.js';

// 客製化圖片
import bgImage from '../images/bg.jpg';


function LoginPage() {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Google 登入成功
      console.log('User:', result.user);

      // 登入成功後導向到成本紀錄頁
      navigate('/cost');
    } catch (error) {
      console.error('Google 登入失敗:', error);
    }
  };

  return (
    <div className="img js-fullheight aaa" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="mask">
            <section className="ftco-section" >
              <div className="container">
                <div className="row justify-content-center">
                  <div className="col-md-6 text-center mb-5">
                    <h2 className="heading-section">炒幣萬歲</h2>
                  </div>
                </div>
                <div className="row justify-content-center">
                  <div className="col-md-6 col-lg-4">
                    <div className="login-wrap p-0">
                      <h3 className="mb-4 text-center">有帳號嗎？</h3>
                      <form action="#" className="signin-form">
                        <div className="form-group">
                          <input type="text" className="form-control" placeholder="Username" required />
                        </div>
                        <div className="form-group">
                          <input id="password-field" type="password" className="form-control" placeholder="Password" required
                          />
                          {/* <span toggle="#password-field" className="fa fa-fw fa-eye field-icon toggle-password"></span> */}
                        </div>
                        <div className="form-group">
                          <button type="submit" className="form-control btn btn-primary submit px-3">
                            Sign In
                          </button>
                        </div>
                        <div className="form-group d-md-flex">
                          <div className="w-50">
                            <label className="checkbox-wrap checkbox-primary">
                              Remember Me
                              <input type="checkbox" defaultChecked />
                              <span className="checkmark"></span>
                            </label>
                          </div>
                          <div className="w-50 text-md-right">
                            <a href="#" style={{ color: '#fff' }}>
                              Forgot Password
                            </a>
                          </div>
                        </div>
                      </form>
                      <p className="w-100 text-center">&mdash; Or Sign In With &mdash;</p>
                      <div className="social d-flex text-center">
                        <a onClick={handleGoogleSignIn} className="px-2 py-2 mr-md-1 rounded btn btn-google">
                          <span className="fa fa-google mr-2"></span> Google
                        </a>
                        <a href="#" className="px-2 py-2 ml-md-1 rounded"><span className="ion-logo-twitter mr-2"></span> Twitter</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
        </div>
    </div>
  );
}

export default LoginPage;