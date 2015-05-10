---
layout: post
title:  "Screen vs Tmux"
date:   2013-08-27 11:15:02
categories:
- productivity
- unix
permalink: sample-post
---

I am a long time fan and user of [GNU Screen] and when I began pair-programming I found out that I had to use [Tmux] in order to pair program remotely (ie- via ssh) I was a little dismayed at this new barrier to entry, especially since I was still in my early development days. I did a little digging into screen and it turned out that sharing a screen session is just as easy as in tmux. Here is how you do it:

{% highlight sh %}
#First - Set permissions on the screen directory.
chmod 755 /var/run/screen
#Second - Create a session (the -S flag gives it the name shared)
screen -S shared
#Third - Make the screen multiuser and give access to the someone else.
ctrl-a :multiuser on
ctrl-a :acladd bob #assuming bob is the unix username of the person to share the session with.
#Have bob (the other user) join the session. (Bob types this)
screen -x sean/shared #assuming he is joining sean's screen
#Voila! You are both sharing a session!
{% endhighlight %}


###Is one better than the other?

Ultimately, it comes down to personal preference. Several people whom I have the utmost respect for, namely [Evan Light] and [Nola Stowe] are both proponents of Tmux and even the good people at Thoughtbot have put together [a crash course] on the topic.

**Unfortunately, I disagree.**

The “advantage” of Tmux over Screen is that is allows you to divide your unix screen up into multiple windows. I’ve heard story after story of how people split their screen with windows for editing, koans, fun, and so forth. **That is the crux of my complaint.**

As humans, our `locus of attention` only allows us to focus on a single task at a time. So, by using Tmux, all you are accomplishing is that you are making your workspace smaller. So unless you are like me and lucky to have a thunderbolt display where you have ample screen real estate where dividing up your screen isn’t going to change your usability, I would suggest sticking with screen and creating multiple screens and just label them efficiently.

I was perusing the book `The Art of Unix Usability` by Eric Steven Raymond and Rob W. Landley and they reinforce this idea in their chapter on [Novelty, Consciousness, and the Single Locus of Attention].

They sum their issues into two laws which they attribute to Jef Raskin as he wrote about them first, in his book, *The Humane Interface*.

* Raskin’s First Law: Most human beings can only concentrate on one thing at a time.
* Raskin’s Second Law: Humans take up to ten seconds to prepare for tasks requiring conscious cognition, during which they are unaware of passing time.

The entire book is available [free online].


[GNU Screen]:(http://www.gnu.org/s/screen)
[Tmux]:(http://tmux.sourceforge.net/)
[Evan Light]:(http://evan.tiggerpalace.com/articles/2011/10/17/some-people-call-me-the-remote-pairing-guy-/)
[Nola Stowe]:(http://www.rubygeek.com/2012/02/26/screen-multiplexing-productivity/)
[a crash course]:(http://robots.thoughtbot.com/post/2641409235/a-tmux-crash-course)
[Novelty, Consciousness, and the Single Locus of Attention]:(http://www.catb.org/esr/writings/taouu/html/ch04s01.html)
[free online]:(http://www.catb.org/esr/writings/taouu/html/)