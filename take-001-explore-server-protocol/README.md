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
