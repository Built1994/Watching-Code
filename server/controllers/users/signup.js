const bcrypt = require('bcrypt');
const { user } = require('../../models');
const {
  generateAccessToken,
  sendAccessToken,
  checkAccessToken
} = require('../tokenFunction');

module.exports = async (req, res) => {
  try {
    // 이미 로그인 되어있는 경우
    const { accessToken } = req.cookies;
    const accessTokenData = checkAccessToken(accessToken);
    if (accessTokenData) {
      return res.status(400).json({ message: 'Already logged in!' });
    }

    const { email, password } = req.body;

    // 요청이 잘못된 경우
    if (!email || !password) {
      return res.status(400).json({ message: 'Bad Request!' });
    }

    // 요청받은 정보로 등록된 이미 회원이 존재하는지 확인한다.
    const userInfo = await user.findOne({ where: { email } });
    if (userInfo) {
      return res
        .status(409)
        .json({ message: 'This email information cannot be registered' });
    }

    // 등록 가능한 정보라면 비밀번호를 암호화하고 새로운 회원을 생성한다.
    const hash = await bcrypt.hash(password, 12);
    const newUser = await user.create({
      email,
      password: hash
    });

    // 등록한 유저의 닉네임을 초기화 한다.
    const updateUser = await newUser.update(
      {
        nickname: 'user' + newUser.dataValues.id
      },
      { where: { id: newUser.dataValues.id } }
    );

    console.log(newUser);

    // 토큰을 발급하고 쿠키에 저장한다.
    //const newAccessToken = generateAccessToken(newUser.dataValues);
    //sendAccessToken(res, newAccessToken);

    // 새로 생성한 회원의 아이디를 반환한다.
    res.status(201).json({ id: newUser.dataValues.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
};
