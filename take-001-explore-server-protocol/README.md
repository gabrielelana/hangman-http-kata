# Focus-On
First time I do this kata and I know nothing of the server protocol, how can I explore it? Some time ago I came across [htty](https://github.com/htty/htty), I always wanted to master it but never got/took the time, but this is exactly why we do katas right? So let's do it! I will also take the opportunity to review this HTTP API, to reason about it and to think how to improve it.


# Step-01
Let's see if this thing works
```
$ htty balanced-hangman.herokuapp.com
*** Welcome to  htty , the HTTP TTY. Heck To The Yeah!
http://balanced-hangman.herokuapp.com/> get
 200  OK -- 5 headers -- 61-character body
http://balanced-hangman.herokuapp.com/> body
{
 "index": "/",
 "me": "/me",
 "prisoners": "/prisoners"
}
```


# Step-02
Two resources, `/me` I guess it's the current user/player, `/prisoners` I'm not sure yet but could be related with the current or past games? We will see, for now focus on `/me`, what could I do with this resource?
```
http://balanced-hangman.herokuapp.com/> path /me
http://balanced-hangman.herokuapp.com/me> http-options
 200  OK -- 6 headers -- empty body
http://balanced-hangman.herokuapp.com/me> headers
         Allow: HEAD, OPTIONS, POST, GET
  Content-Type: text/html; charset=utf-8
          Date: Wed, 12 Feb 2014 12:09:49 GMT
        Server: gunicorn/18.0
Content-Length: 0
    Connection: keep-alive
```
We asked what options do we have on this resource, now we know we can `GET` and `POST` on this thing, let's keep it safe and try to `GET` it
```
http://balanced-hangman.herokuapp.com/me> get
 200  OK -- 5 headers -- 4-character body
http://balanced-hangman.herokuapp.com/me> body
null
http://balanced-hangman.herokuapp.com/me> headers
  Content-Type: application/json
          Date: Wed, 12 Feb 2014 12:13:47 GMT
        Server: gunicorn/18.0
Content-Length: 4
    Connection: keep-alive
```
Wow, null? looking at the `Content-Type` not sure if it's a valid `application/json` I must remember it, I guess the json parse will not be happy... Anyway, nothing here, maybe because we are not logged in, but let's look at `/prisoners` before to create side effects


# Step-03
```
http://balanced-hangman.herokuapp.com/me> path /prisoners
http://balanced-hangman.herokuapp.com/prisoners> http-options
 405  Method Not Allowed -- 5 headers -- empty body
http://balanced-hangman.herokuapp.com/prisoners> headers
  Content-Type: application/json
          Date: Wed, 12 Feb 2014 13:28:03 GMT
        Server: gunicorn/18.0
Content-Length: 80
    Connection: keep-alive
```
Too bad, `405 Method Not Allowed` I wonder why... let's try to `get` it anyway
```
http://balanced-hangman.herokuapp.com/prisoners> get
 200  OK -- 5 headers -- 186-character body
http://balanced-hangman.herokuapp.com/prisoners> body
{
 "items": [],
 "offset": 0,
 "first": "/prisoners?offset=0",
 "next": null,
 "limit": 10,
 "total": 0,
 "last": "/prisoners?offset=0",
 "uri": "/prisoners",
 "previous": null
}
```
Seems like some kind of pagination metadata, `/prisoners` (like the plural would suggest) is a collection, we don't know if we can post on it but we will try soon


# Step-04
Back to `/me` resource, `GET /me` returns `null`, let's try an empty `POST`, I hope the server will give us some clue on how to proceed
```
http://balanced-hangman.herokuapp.com/prisoners> path /me
http://balanced-hangman.herokuapp.com/me> post
 400  Bad Request -- 5 headers -- 109-character body
http://balanced-hangman.herokuapp.com/me> body
{
 "status": "Bad Request",
 "status_code": 400,
 "description": "Missing required field [email_address]"
}
```
Good, we need to give it an email address
```
http://balanced-hangman.herokuapp.com/me> body-set
*** Enter two blank lines, or hit Ctrl-D, to signify the end of the body
email_address=me@example.com


http://balanced-hangman.herokuapp.com/me> post
 400  Bad Request -- 5 headers -- 104-character body
http://balanced-hangman.herokuapp.com/me> body
{
 "status": "Bad Request",
 "status_code": 400,
 "description": "Missing required field [password]"
}
```
Nice! a password is also required, seems reasonable, let's do it
```
http://balanced-hangman.herokuapp.com/me> body-set
*** Enter two blank lines, or hit Ctrl-D, to signify the end of the body
email_address=me@example.com&password=hangman


http://balanced-hangman.herokuapp.com/me> post
*** Type fol[low] to follow the 'Location' header received in the response
 201  Created -- 6 headers -- 291-character body
http://balanced-hangman.herokuapp.com/me> body
{
 "id": "jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=",
 "prisoners": "/prisoners",
 "uri": "/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=",
 "email_address": "me@example.com",
 "stats": {
  "started_at": null,
  "dead": 0,
  "help": 0,
  "rescued": 0,
  "ended_at": null
 }
}
http://balanced-hangman.herokuapp.com/me> headers
  Content-Type: application/json
          Date: Wed, 12 Feb 2014 13:48:23 GMT
      Location: http://balanced-hangman.herokuapp.com/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=
        Server: gunicorn/18.0
Content-Length: 291
    Connection: keep-alive
```
Success! We are in! I think...


# Step-05
```
http://balanced-hangman.herokuapp.com/me> get
 200  OK -- 5 headers -- 4-character body
http://balanced-hangman.herokuapp.com/me> body
null
```
`GET /me` is still null... this is not useful at all, maybe `GET /me` should return a `405 Method Not Allowed`? And so `OPTION /me` must not include it?
```
http://balanced-hangman.herokuapp.com/me> path /users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=
http://balanced-hangman.herokuapp.com/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=> get
 403  Forbidden -- 5 headers -- 198-character body
http://balanced-hangman.herokuapp.com/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=> body
{
 "status": "Forbidden",
 "status_code": 403,
 "description": "<p>You don't have the permission to access the requested resource. It is either read-protected or not readable by the server.</p>"
}
```
`403 Forbidden` sound strange, but I get it, `/me` is used to create an user resource with username and password, to access this resource you need to provide those username and password
```
http://balanced-hangman.herokuapp.com/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=> userinfo-set me@example.com hangman
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=> get
 200  OK -- 5 headers -- 291-character body
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=> body
{
 "id": "jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=",
 "prisoners": "/prisoners",
 "uri": "/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=",
 "email_address": "me@example.com",
 "stats": {
  "started_at": null,
  "dead": 0,
  "help": 0,
  "rescued": 0,
  "ended_at": null
 }
}
```
Yes! We are really in! What I have done here is to provide username and password for a Basic Authorization, look at it
```
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=> headers-request
    User-Agent: htty/1.4.1
Authorization:@ Basic bWVAZXhhbXBsZS5jb206aGFuZ21hbg==
```
We are sending an `Authorization` header, now, let's look around with those valid credentials


# Step-06
```
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners> path /users
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/users> get
 404  Not Found -- 5 headers -- 202-character body
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/users> body
{
 "status": "Not Found",
 "status_code": 404,
 "description": "<p>The requested URL was not found on the server.</p><p>If you entered the URL manually please check your spelling and try again.</p>"
}
```
Mmm, ok, `users` doesn't exists, I don't like it but let's move on
```
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/users> path /prisoners
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners> get
 200  OK -- 5 headers -- 186-character body
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners> body
{
 "items": [],
 "offset": 0,
 "first": "/prisoners?offset=0",
 "next": null,
 "limit": 10,
 "total": 0,
 "last": "/prisoners?offset=0",
 "uri": "/prisoners",
 "previous": null
}
```
`/prisoners` is unchanged with valid credentials, let's try to post on it
```
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners> post
*** Type fol[low] to follow the 'Location' header received in the response
 201  Created -- 6 headers -- 327-character body
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners> body
{
 "word": "*************",
 "misses": [],
 "guesses_remaining": 20,
 "guesses": "/prisoners/5guXaUAUQY8=/guesses",
 "user": "/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=",
 "hits": [],
 "id": "5guXaUAUQY8=",
 "state": "help",
 "uri": "/prisoners/5guXaUAUQY8=",
 "imprisoned_at": "2014-02-12T14:19:26.244308Z"
}
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners> get
 200  OK -- 5 headers -- 540-character body
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners> body
{
 "items": [
  {
   "word": "*************",
   "misses": [],
   "guesses_remaining": 20,
   "guesses": "/prisoners/5guXaUAUQY8=/guesses",
   "user": "/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=",
   "hits": [],
   "id": "5guXaUAUQY8=",
   "state": "help",
   "uri": "/prisoners/5guXaUAUQY8=",
   "imprisoned_at": "2014-02-12T14:19:26.244308Z"
  }
 ],
 "offset": 0,
 "first": "/prisoners?offset=0",
 "next": null,
 "limit": 10,
 "total": 1,
 "last": "/prisoners?offset=0",
 "uri": "/prisoners",
 "previous": null
}
```
Cool! We created a new prisoner resource aka a new game, I only need to find out how to play


# Final Considerations
* I don't like the `null` as an `application/json` representation of the resource `/me` when you are not logged in, ...
* I don't like that `OPTION` method is not implemented on `/prisoners` resource, ...
* I don't like that links are relative in the resources representation, ...
* I don't like the `403 Forbidden`, ...
* I don't like that `/users` doesn't exists when `/users/:id` exists
* Is prisoner part of the ubiquitous language of the hangman game domain? I really don't know but I didn't found it too easy to understand but I'm not a native speaker so I guess it's ok
