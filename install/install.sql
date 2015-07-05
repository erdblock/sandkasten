-- Adminer 4.2.1 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';

DELIMITER ;;

DROP PROCEDURE IF EXISTS `addInstance`;;
CREATE PROCEDURE `addInstance`(IN `pluginId` int, IN `userId` int)
BEGIN

SELECT `AUTO_INCREMENT` AS ai FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME   = 'pluginInstances';
INSERT INTO `pluginInstances` (`pluginId`, `userId`) VALUES (  pluginId, userId );

END;;

DROP PROCEDURE IF EXISTS `addPublisherInstance`;;
CREATE PROCEDURE `addPublisherInstance`(IN `publisherId` int(10) unsigned, IN `userId` int(10) unsigned)
BEGIN

SELECT `AUTO_INCREMENT` AS ai FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME   = 'publisherInstances';
INSERT INTO `publisherInstances` (`publisherId`, `userId`) VALUES (  publisherId, userId );

END;;

DROP PROCEDURE IF EXISTS `addUser`;;
CREATE PROCEDURE `addUser`(IN `u` text, IN `p` text)
BEGIN

SELECT `AUTO_INCREMENT` AS ai FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME   = 'user'
AND NOT ( SELECT 1 FROM user WHERE username = u LIMIT 1) LIMIT 1;


-- INSERT INTO user (username, password) SELECT u, p FROM user
-- WHERE NOT EXISTS ( SELECT 1 FROM user WHERE username = u LIMIT 1) LIMIT 1;

END;;

DELIMITER ;

CREATE TABLE `pluginConfig` (
  `userID` int(10) unsigned NOT NULL,
  `pluginInstanceId` int(10) unsigned NOT NULL,
  `key` text COLLATE utf8_unicode_ci NOT NULL,
  `value` text COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`pluginInstanceId`,`key`(100),`userID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


CREATE TABLE `pluginInstances` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `pluginId` int(10) unsigned NOT NULL,
  `userId` int(10) unsigned NOT NULL,
  `priority` int(10) NOT NULL DEFAULT '100',
  `enabled` int(1) unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`,`userId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


CREATE TABLE `plugins` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `npmName` text COLLATE utf8_unicode_ci NOT NULL COMMENT 'eg. erdblock-website',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


CREATE TABLE `publisherConfig` (
  `userID` int(10) unsigned NOT NULL,
  `publisherInstanceId` int(10) unsigned NOT NULL,
  `key` text COLLATE utf8_unicode_ci NOT NULL,
  `value` text COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`publisherInstanceId`,`key`(100),`userID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


CREATE TABLE `publisherInstances` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `publisherId` int(10) unsigned NOT NULL,
  `userId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


CREATE TABLE `publishers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `npmName` text COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


CREATE TABLE `user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` text COLLATE utf8_unicode_ci NOT NULL,
  `password` text COLLATE utf8_unicode_ci NOT NULL,
  `title` text COLLATE utf8_unicode_ci NOT NULL,
  `subtitle` text COLLATE utf8_unicode_ci NOT NULL,
  `profileImagePath` text COLLATE utf8_unicode_ci NOT NULL,
  `coverImagePath` text COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


-- 2015-06-03 19:51:31
