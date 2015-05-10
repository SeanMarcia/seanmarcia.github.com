---
layout: post
title:  "SQL old School"
date:   2014-04-15 01:08:49
categories:
- SQL
comments: true
---


Those of us who use Rails and have access to its magnificent ORM often take for granted how much it gives us. This came up recently when I needed to find some duplicate entries using SQL queries. I’ve changed table names to keep things private but everything else is the same.

Let say you have a database table (songtable) of songs where you want to remove the all the duplicate songs. The database has the columns title, band and year. While it is possible to do this all in one table, something about me likes to create a temporary table, verify it and then replace the original table.

Simply start by creating your temporary table.

{% highlight ruby %}
CREATE table songtable_temp
    (title  varchar(30),
     band varchar(30),
     year   varchar(10));
{% endhighlight %}

Now that we have our temporary table we just throw in all the values from our original songtable making sure we use group by. Group by will catch all copies and consolidate them.

{% highlight ruby %}
INSERT into songtable_temp
    SELECT title,band,year
    FROM songtable
    GROUP BY title,band,year
{% endhighlight %}

In this example you would definitely need to group by title and band since multiple bands can record the same song and grouping by year might also be a good thing since bands often re-release versions of the song. Now that you have the correct values, you just need to clear the original table.

{% highlight ruby %}
TRUNCATE table songtable
{% endhighlight %}


It is important you use truncate rather than delete or drop. Delete is generally just for removing specific rows and drop removes the table all together. Truncate removes everything from the table but keeps it structure intact. Now we can put all the values back into the first table with the duplicates removed.

{% highlight ruby %}
INSERT into songtable
    SELECT * from songtable_temp
{% endhighlight %}

Now just drop the temporary table and you are finished.

{% highlight ruby %}
DROP table songtable_temp
{% endhighlight %}

