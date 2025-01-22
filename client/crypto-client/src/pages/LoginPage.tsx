// src/pages/LoginPage.tsx
import React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

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
        <section className="ftco-section">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-6 text-center mb-5">
                <h2 className="heading-section">炒幣萬歲</h2>
              </div>
            </div>
            <div className="row justify-content-center">
              <div className="col-md-6 col-lg-4">
                <div className="login-wrap p-0 text-center">
                  <h6 className="mb-0 pb-3"><span>登入 </span><span>註冊</span></h6>
                  <input className="checkbox reg-log" type="checkbox" id="reg-log" name="reg-log" />
                  <label htmlFor="reg-log"></label>
                  <div className="card-3d-wrap">
                    <div className="card-3d-wrapper">
                      {/* 登入 Page */}
                      <div className="card-front">
                        <div className="center-wrap">
                          <div className="section text-center">
                            <h4 className="mb-4 pb-3" style={{ color: '#fff' }}>登入</h4>
                            <form className="signin-form">
                              <div className="form-group">
                                <input type="text" className="form-control" placeholder="您的姓名" required />
                              </div>
                              <div className="form-group">
                                <input type="password" className="form-control" placeholder="您的密碼" required />
                              </div>
                              <div className="form-group">
                                <button type="submit" className="form-control btn btn-primary submit px-3">登入</button>
                              </div>
                              <div className="form-group d-md-flex">
                                <div className="w-50">
                                  <label className="checkbox-wrap checkbox-primary">
                                    記住密碼
                                    <input type="checkbox" defaultChecked />
                                    <span className="checkmark"></span>
                                  </label>
                                </div>
                                <div className="w-50 text-md-right">
                                  <a href="#" style={{ color: '#fff' }}>忘記密碼?</a>
                                </div>
                              </div>
                            </form>
                          </div>
                        </div>
                        <p className="w-100 text-center mt-4">&mdash; Or Sign In With &mdash;</p>
                        <div className="social d-flex text-center">
                          <a onClick={handleGoogleSignIn} className="px-2 py-2 mr-md-1 rounded btn btn-google">
                            <span className="fa fa-google mr-2"></span> Google
                          </a>
                          <a href="#" className="px-2 py-2 ml-md-1 rounded">
                            <span className="ion-logo-twitter mr-2"></span> Twitter
                          </a>
                        </div>
                      </div>
                      {/* 註冊 Page */}
                      <div className="card-back">
                        <div className="center-wrap">
                          <div className="section text-center">
                            <h4 className="mb-4 pb-3" style={{ color: '#fff' }}>註冊</h4>
                            <form className="signup-form">
                              <div className="form-group">
                                <input type="text" className="form-control" placeholder="您的姓名" required />
                              </div>
                              <div className="form-group">
                                <input type="email" className="form-control" placeholder="您的電子郵件" required />
                              </div>
                              <div className="form-group">
                                <input type="password" className="form-control" placeholder="您的密碼" required />
                              </div>
                              <div className="form-group">
                                <button type="submit" className="form-control btn btn-primary submit px-3">註冊</button>
                              </div>
                            </form>
                          </div>
                        </div>
                        <p className="w-100 text-center mt-4">&mdash; Or Sign In With &mdash;</p>
                        <div className="social d-flex text-center">
                          <a onClick={handleGoogleSignIn} className="px-2 py-2 mr-md-1 rounded btn btn-google">
                            <span className="fa fa-google mr-2"></span> Google
                          </a>
                          <a href="#" className="px-2 py-2 ml-md-1 rounded">
                            <span className="ion-logo-twitter mr-2"></span> Twitter
                          </a>
                        </div>
                      </div>
                    </div>
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