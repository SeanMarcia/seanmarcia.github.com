---
layout: post
title:  "Validate Email Without Regex"
date:   2013-07-21 01:08:49
categories:
- ruby
comments: true
---

There has been some talk recently about validating e-mail without using regular expressions.

I’m sure we’ve all used or seen something like this:

{% highlight ruby %}
class User < ActiveRecord::Base
  attr_accessible :email

  email_regex = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i

  validates :email, :presence => true,
                    :format   => { :with => email_regex }
end
{% endhighlight %}

It works, but it uses the evil regex.

____

####What’s my solution?

David Cellis recently posted [how he does it] and I thought I’d also provide how I do it as well. I really like David’s solution and also understand that mine is probably overkill but I do feel that mine will catch more invalid e-mails that David’s way misses. I should also point out that I realize that mine is overkill since we all tend to confirm emails with gems like `Devise` so if someone enters in an incorrect email they'll figure it out on their own.

The user model:

{% highlight ruby %}
class User < ActiveRecord::Base
  validates :email, :presence => true, :email => true
end
{% endhighlight %}

From here I use a custom rails validator which I call `app/validators/email_validator.rb`.

Here is my validator file:

{% highlight ruby %}
require 'mail'
class EmailValidator < ActiveModel::EachValidator
  def validate_each(record,attribute,value)
    begin
      m = Mail::Address.new(value)
      r = m.domain && m.address == value
      t = m.__send__(:tree)
      r &&= (t.domain.dot_atom_text.elements.size > 1)
    rescue Exception => e
      r = false
    end
    record.errors[attribute] << (options[:message] || "is invalid") unless r
  end
end
{% endhighlight %}

No regex!

If are not familiar with rails validators they function much the same way as initializers (`/config/initializers/`) in that rails will load them at startup if they are in your `app/validators/` directory. If you want them in another directory such as `lib/validators/` which seems to be the convention simply add the following to your config/application.rb file:

{% highlight ruby %}
config.autoload_paths += %W["#{config.root}/lib/validators/"]
{% endhighlight %}

[how he does it]:(http://davidcelis.com/blog/2012/09/06/stop-validating-email-addresses-with-regex/)