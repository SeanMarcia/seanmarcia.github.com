---
layout: post
title: "Intro to DevOps"
date:   2014-02-08 11:15:02
banner_image: devops.jpg
category:
- devops
- guide
---

**Update:** I gave this talk at the [DC Ruby Users Group] and was asked which of the following solutions I chose and why. I chose Chef for provisioning and configuring servers mostly because I have friends in the Chef community but if I were to choose again, I would likely use Ansible as Chef is more power than I need since we only have three servers. I chose Capistrano for deployment because I’ve used it in the past and found it dead simple to use. I use Airbrake for errors (but am looking into bugsnag) and monitoring with New Relic. I don’t aggregate my logs or monitor my servers other than what New Relic and Airbrake give mostly because it didn’t make sense with the small architecture we have. **End Update**

We used manage hosting at work and when we recently scaled out our architecture we found that at our host, despite us having a single application, increased the prices proportionally with the number of servers. We understand that each additional server costs an additional fee but there was no break on support costs. We know that they, like a lot of companies, use AWS for infrastructure and so we are able to price out what our instances cost and saw that we were paying a premium of approximately $150 a month for the insurance of being able to call someone up in case of trouble or if we are having any issues. The problem and what we couldn’t justify the extra expense for was that the premium is levied on each server so having 2 application servers rather than one which would not double the number of support calls or use of their services would still double our support costs. While we have avoided having a DevOps team ourselves it finally made sense to learn the tools. I was surprising how easy and “rubylike” many of them were. I decided to share what I learned because we have recently had members of the meet-up group I help organize asking what exactly DevOps is.

###What is DevOps?
You hear a lot of people talk about DevOps but generally they are saying things like Chef, Puppet, Nagios and so forth. While those are all components of DevOps, I did some looking and the best description I could find was “System administrators participating in an agile development process alongside developers and using many of the same agile techniques for their systems work.” I’m assuming if you are reading this you are a developer who was tasked with becoming their companies DevOps person.

###What are the required skills needed for DevOps?
I found this to be a pretty difficult question to answer and it made sense to differentiate between technical and non-technical skills.

Assuming you are developer and have those skills covered, you will need to do a deep dive into system administration and all the requisite unix skills. While the list of unix skills is quite expansive (grep, sed, cat, chmod, du, shell scripting, TCP/IP networking, DNS, mail, virtualization, and so on) the two books I own that are excellent reference manuals are:

![book1](/assets/images/book1.jpg)

and

![book1](/assets/images/book2.jpg)


###Responsibilities of DevOps
As the DevOps person, these are the things you are going to want to think about:

* provisioning virtual machines
* configuring network devices and servers
* deploying you applications
* collecting logs * monitoring applications
* monitoring your hardware
* monitoring application performance

**You want to automate everything**

####Provisioning and Configuring Servers

* Chef
* Ansible
* Puppet
* Shell Scripts
* Manual

Chef, Ansible and Puppet all work in a similar fashion. You write recipes, manifests or playbooks so you can repeat the same actions over and over. Repeatability is paramount as you want to be able create an identical environment every time you spin up a server. This helps in consistency and ensures that you will be able to easily identify and track down errors. If each server is configured differently you might mistake a configuration conflict with a an application error. You will need to pick a cloud provider like AWS, Rackspace or Digital Ocean as a place for deploying your servers to.

####Deploying your Application
Part of the deployment process and something that is under the purview of DevOps is the deployment process. An example deployment process might look something like this:

1. Continuous Integration shows all tests are passing.
2. Deploy the Application to your testing environment.
3. QA tests the Application and approves deployment.
4. Deploy the Application to production.

All the steps in there are monitored by DevOps. DevOps monitors and configures your CI server, spins up testing environments and deploys to that environment and then deploys to production.

There are several good choices for CI, some of the popular choices are:

* Jenkins
* Travis
* CruiseControl

There are also numerous options for deploying your application such as:

* Capistrano
* Fabric
* Shell Scripts

It is possible to your provisioning tool (like Chef) to also handle the deploying of your application but personally I like the separation of responsibilities.

####Log Collection
Having all your server logs in one place is extremely valuable especially when you are trying to track down errors. You will want to brush up on your Unix commands like grep to make searching and parsing these logs easy. A couple of popular logging applications are:

* Loggly
* LogStash

####Monitoring Applications

Monitoring and application performance tools go hand in hand since you typically monitor for performance uptime. In the Ruby/Rails community the two most popular error monitoring services that will let you know when exceptions have occurred are:

* Airbrake
* Honeybadger
* Bugsnag

For monitoring things like how fast pages are loading, which pages are problem pages, CPU usage, memory and so on, the two most popular performance monitoring tools are:

* New Relic
* Scout

####Monitoring your Hardware/Servers

You will want to monitor that unix services are running (ssh, mail, pop, http) in addition to seeing if a server, load balancer or db server is down. Good monitoring tools will also be customizable to show how much space is left on a give server in a given directory, monitor your databases and how long a connect takes as well as the lag time to the slave dbs. Monitoring software is also configurable to send alerts that you can customize for each of these things. The most popular hardware monitoring software is:

* Nagios
* Icinga
* Sensu
* Zabbix

####Non Technical Skills

DevOps also needs to be aware of what the business side is doing. A good read on more about this can be had with the following book:

![book1](/assets/images/book3.png)


Two especially important areas for DevOps to work in conjunction with are:

* Sales
* Marketing

If it isn’t apparent why, just imagine if a marketing team were to run a series of advertisements; perhaps at an event like the Superbowl where your application will be heard about by millions and then get swamped with traffic afterwards. If you are aware of the coming traffic you can spin up extra servers to handle the traffic so your customers are not left dissatisfied. A similar story is easy to imagine with sales. If your sales team is promising features to clients, as DevOps you need to be aware of that so you can ensure you have environments for QA to test and to be sure that the features go through the full testing process.

####Maintenance

I’ve included maintenance in here because you are going to have to deal with budget/finance people. If you are paying for a support contract with new relic or airbrake or you want to start paying for a different service of some sort. The money people tend to want to know about these contracts, how long they will last, how much they will cost and so on. The other part of maintenance, such as updating and patching software often can take a LOT of time. If the DevOps team is planning to upgrade/patch/change from ubuntu 10.04 to 13.04 because 10.04 doesn’t fully support a new feature you want to add you might be looking at a multi day or event week process as you upgrade everything. People will need to know that devops will be out of commission or devoting a lot of time to it.

###Benefits
Assuming you have done all the DevOps things correctly the benefits you are looking at are:

* Faster and easier deployments
* Easier to roll back from mistakes
* Less Problems to fix
* Less time spent fixing things and more time developing
* Faster roll out of features

[DC Ruby Users Group]:(http://www.meetup.com/dcruby/events/101392262/)
