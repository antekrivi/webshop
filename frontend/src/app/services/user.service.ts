import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../shared/models/User';
import { IUserLogin } from '../shared/interfaces/IUserLogin';
import { HttpClient } from '@angular/common/http';
import { SHOW_USERS_URL, USER_BY_ID_URL, USER_DELETE_URL, USER_EDIT_URL, USER_LOGIN_URL, USER_REGISTER_URL } from '../shared/constants/urls';
import { ToastrService } from 'ngx-toastr';
import { IUserRegister } from '../shared/interfaces/IUserRegister';


const USER_KEY  = 'user';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userSubject = new BehaviorSubject<User>(this.getUserFromLocalStorage());
  public userObservable: Observable<User>;

  constructor(private http:HttpClient, private toastrService: ToastrService) {
    this.userObservable = this.userSubject.asObservable();
   }
   
   public get currentUser():User{
    return this.userSubject.value;
   }

   login(userLogin:IUserLogin):Observable<User>{
    return this.http.post<User>(USER_LOGIN_URL, userLogin).pipe(
      tap({
        next: (user) => {
          this.setUserToLocalStorage(user);
          this.userSubject.next(user);
          this.toastrService.success(
            `Welcome to Foodmine ${user.name}!`,
            'Login Successful'
          )
        },
        error: (errorResponse) => {
          this.toastrService.error(
            errorResponse.error, 'Login Failed');
        }
    }));
  }

  register(userRegister: IUserRegister) : Observable<User>{
    return this.http.post<User>(USER_REGISTER_URL, userRegister).pipe(
      tap({
        next: (user) => {
          this.setUserToLocalStorage(user);
          this.userSubject.next(user);
          this.toastrService.success(
            `Welcome to the Webshop ${user.name}!`,
            'Registration Successful'
          )
        },
        error: (errorResponse) => {
          this.toastrService.error(errorResponse.error, 'Registration Failed');
        }
      })
    )
  }

  logout(){
    this.userSubject.next(new User());
    localStorage.removeItem(USER_KEY);
    window.location.reload();
  }

  private setUserToLocalStorage(user: User){
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  private getUserFromLocalStorage():User{
    const userJson = localStorage.getItem(USER_KEY);
    if(userJson) return JSON.parse(userJson) as User;
    return new User();
  }

  updateUser(user: User): Observable<User>{
    return this.http.put<User>(`${USER_EDIT_URL}/${user.id}`, user).pipe(
      tap({
        next: (updatedUser) => {
          this.setUserToLocalStorage(updatedUser);
          this.userSubject.next(updatedUser);
          this.toastrService.success(
            `Profile updated successfully!`,
            'Update Successful'
          )
        },
        error: (errorResponse) => {
          this.toastrService.error(errorResponse.error, 'Update Failed');
        }
      })
    )
  }

  getUsers(): Observable<User[]>{
    return this.http.get<User[]>(SHOW_USERS_URL);
  }

  deleteUser(id: string): Observable<void>{
    return this.http.delete<void>(`${USER_DELETE_URL}/${id}`);
  }

  getUserById(id: string): Observable<User>{
    return this.http.get<User>(`${USER_BY_ID_URL}/${id}`);
  }
  
}


