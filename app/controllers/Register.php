<?php 

class Register extends Controller {
    public function index(){
        $title = 'Đăng ký thành viên';
        $this->data['page_title'] = $title;
        $this->data['content'] = 'register/index';
        $this->data['sub_content']['msg'] = Session::flash('msg');

        $this->render('layouts/client_layout', $this->data);
    }

    public function validate(){
        $request = new Request();
        if($request->isPost()){
            //set rule
            $request->rules([
                'fullname' => 'min:5|max:50',
                'email' => 'min:5|max:50|callback_check_email',
                'username' => 'min:5|max:50|callback_check_username',
                'password' => 'min:3',
            ]);

            // set message
            $request->message([
                'username.min' => 'Tên đăng nhập phải có ít nhất 5 ký tự',
                'username.max' => 'Tên đăng nhập không được quá 50 ký tự',
                'username.unique' => 'Tên đăng nhập đã tồn tại',
                'password.min' => 'Mật khẩu phải có ít nhất 3 ký tự'
            ]);

            // validate
            $validate = $request->validate();
            if(!$validate){
                Session::data('msg', 'Đăng ký lỗi, kiểm tra lại thông tin');
                $response = new Response();
                $response->redirect('login');
            } else {
                $response = new Response();
                $this->register_user($_POST['username'], $_POST['password']);
                Session::data('msg', 'Đăng ký thành công');
                Session::data('user', $_POST['username']);
                $response->redirect('home');
            }
        }
    }

    public function check_username(){
        $db = new Database();
        $username = $_POST['username'];
        $check = $db->table('tb_user')->where('username', '=', $username)->count();
        if($check > 0){
            $request = new Request();
            $request->setError('username', 'check_username');
            return false;
        } else {
            return true;
        }
    }
    public function check_email(){
        $db = new Database();
        $email = $_POST['email'];
        $check = $db->table('tb_user')->where('email', '=', $email)->count();
        if($check > 0){
            $request = new Request();
            $request->setError('email', 'check_email');
            return false;
        } else {
            return true;
        }
    }

    private function register_user($username, $password){
        $db = new Database();
        $password = md5($password);
        $data = [
            'username' => $username,
            'password' => $password
        ];
        $db->table('tb_user')->insert($data);
    }
}
?>