---
layout: post
title: "My Irssi Setup"
date:   2013-10-25 0:00:55
banner_image: terminal.png
categories:
- unix
- irssi
---

I’m always surprised by my vim and emacs friends when they tell me they use an irc client like [Textual]. Don’t get me wrong, it is an amazing client but if you are a command line advocate I think you need to check out [Irssi].

Irssi’s big win for me is that you can use a terminal multiplexer like [GNU Screen] or [Tmux] and set your session up on a server and then you can just ssh into your server and reattach your session. So you never have to miss out on any conversations or cat pictures.

Much like vim or emacs the great thing about irssi is how customizable it is. On the official irssi site there is a list of [scripts/plugins] you can install to make it your own. A quick Github search will also yield a lot of people’s plugins that they have created that you can further experiment with. Or, like any other piece of open source software, you can always create your own.

Here are the scripts I routinely use:

* `adv_windowlist.pl` - This allows you to customize your irssi window, much like the vim powerline plugin. I customize my irssi with the following:
  * `/set awl_display_key $Q%K|%n$H$C$S` - This makes each of the irc windows look more ircish by adding an octothorpe before each channel name.
  * `/set awl_display_key_active $Q%K|%n$H%U$C$S%n` - This makes the active window underlined so I know who I’m talking to.
* `nickcolor.pl` - This colourizes the names of everyone in the channel. It makes it easier to separate out who is saying what.
* `nicklist.pl` - Adds a display of who is in the channel. You activate it with:
  * `/NICKLIST SCREEN` - This assumes you are using screen rather than tmux.
* `usercount.pl` - Adds a count of how many people are in the channel into the powerline. You activate it with:
  * `/statusbar` window add usercount

All scripts should be put in the `~/.irssi/scripts/autorun` if you want them auto loaded when you open irssi or in `~/.irssi/scripts` if you want to manually load them. To manually load a script you just type: `/script load nickcolor.pl`

I also take advantage of a lot of irssi’s built in functionality like hilight, log, ignore and so forth. The [irssi manual] gives a lot of information on customizing irssi.

When you are finished you have a beautiful irssi window that displays everything you need. It should look remarkably like the banner image for this post. :)

All the scripts I mention here are available in my [irssi github repo].

[Textual]:(http://www.codeux.com/textual/)
[Irssi]:(http://www.irssi.org/)
[GNU Screen]:(http://www.gnu.org/s/screen)
[Tmux]:(http://tmux.sourceforge.net/)
[irssi github repo]:(https://github.com/SeanMarcia/irssi)
[irssi manual]:(http://quadpoint.org/articles/irssi/)
[scripts/plugins]:(http://scripts.irssi.org/)
