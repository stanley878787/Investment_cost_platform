// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword , setPersistence, browserLocalPersistence, browserSessionPersistence, sendPasswordResetEmail } from 'firebase/auth';
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

  const [registerData, setRegisterData] = useState({
    nickname: '',
    email: '',
    password: ''
  })

  const [rememberMe, setRememberMe] = useState(true);

  const handleEmailSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try{
      const { email, password } = registerData;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('註冊成功', userCredential.user);

      navigate('/cost'); //導向cost頁面
    } catch (err) {
      console.error('email註冊失敗', err);
      alert('註冊失敗: ' + (err as Error).message);
    }
  }

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try{
      if (rememberMe){
        await setPersistence(auth, browserLocalPersistence)
      } else {
        await setPersistence(auth, browserSessionPersistence)
      }
      const userCredential = await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      console.log('Enmail登入成功:', userCredential.user);
      navigate('/cost');
    } catch (err){
      console.error('Email登入失敗', err);
      alert('登入失敗: ' + (err as Error).message);
    }
  }

  // 忘記密碼
  const handleForgotPassword = async () => {
    const email = prompt('請輸入Email');
    if(!email) return;

    try {
      await sendPasswordResetEmail(auth, email);
      alert('已寄送重設密碼連結到: ' + email);
    } catch (error) {
      alert('發送失敗: ' + (error as Error).message);
    }
  }

  return (
    <div className="img js-fullheight" style={{ backgroundImage: `url(${bgImage})` }}>
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
                            <form className="signin-form" onSubmit={handleEmailSignIn}>
                              <div className="form-group">
                                <input type="text" className="form-control" placeholder="您的電子郵件" required value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}/>
                              </div>
                              <div className="form-group">
                                <input type="password" className="form-control" placeholder="您的密碼" required value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}/>
                              </div>
                              <div className="form-group">
                                <button type="submit" className="form-control btn btn-primary submit px-3">登入</button>
                              </div>
                              <div className="form-group d-md-flex">
                                <div className="w-50">
                                  <label className="checkbox-wrap checkbox-primary">
                                    記住密碼
                                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} defaultChecked />
                                    <span className="checkmark"></span>
                                  </label>
                                </div>
                                <div className="w-50 text-md-right">
                                  <a onClick={handleForgotPassword} style={{ color: '#fff' }}>忘記密碼?</a>
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
                          {/* <a href="#" className="px-2 py-2 ml-md-1 rounded">
                            <span className="ion-logo-twitter mr-2"></span> Twitter
                          </a> */}
                        </div>
                      </div>
                      {/* 註冊 Page */}
                      <div className="card-back">
                        <div className="center-wrap">
                          <div className="section text-center">
                            <h4 className="mb-4 pb-3" style={{ color: '#fff' }}>註冊</h4>
                            <form className="signup-form" onSubmit={handleEmailSignUp}>
                              <div className="form-group">
                                <input type="text" className="form-control" placeholder="您的暱稱" required value={registerData.nickname} onChange={(e) => setRegisterData({ ...registerData, nickname: e.target.value })}/>
                              </div>
                              <div className="form-group">
                                <input type="email" className="form-control" placeholder="您的電子郵件" required value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} />
                              </div>
                              <div className="form-group">
                                <input type="password" className="form-control" placeholder="您的密碼" required value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}/>
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
                          {/* <a href="#" className="px-2 py-2 ml-md-1 rounded">
                            <span className="ion-logo-twitter mr-2"></span> Twitter
                          </a> */}
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