-- phpMyAdmin SQL Dump
-- version 4.2.10
-- http://www.phpmyadmin.net
--
-- Host: localhost:8889
-- Generation Time: May 09, 2016 at 06:33 PM
-- Server version: 5.5.38
-- PHP Version: 5.6.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+01:00";

--
-- Database: `kanban`
--

-- --------------------------------------------------------

--
-- Table structure for table `card`
--

CREATE TABLE `card` (
  `id` varchar(256) NOT NULL,
  `name` varchar(256) NOT NULL,
  `description` longtext NOT NULL,
  `color` varchar(256) NOT NULL,
  `owner` longtext NOT NULL,
  `createdOn` bigint(20) NOT NULL,
  `lastChange` bigint(20) NOT NULL,
  `json` longtext NOT NULL,
  `kanban` varchar(256) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `kanban`
--

CREATE TABLE `kanban` (
  `id` varchar(256) NOT NULL DEFAULT '0',
  `name` varchar(256) NOT NULL,
  `numberOfColumns` int(11) NOT NULL,
  `columns` longtext NOT NULL,
  `settings` longtext NOT NULL,
  `json` longtext NOT NULL,
  `timestamp` bigint(20) NOT NULL,
  `servertimestamp` bigint(20) NOT NULL,
  `browser` varchar(256) NOT NULL,
  `event` varchar(256) NOT NULL,
  `eventdetails` varchar(256) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `kanban`
--

INSERT INTO `kanban` (`id`, `name`, `numberOfColumns`, `columns`, `settings`, `json`, `timestamp`, `servertimestamp`, `browser`, `event`, `eventdetails`) VALUES
('36434cac-012a-4147-a0ca-c8f03c683e2b', 'seed', 3, '["aef7acc5-1297-4ee8-a695-2322c317675e","50695e55-0e7c-4075-a42b-207faaf703f2","b6396b6e-6157-4a2a-8de5-12e59018a641"]', '', '{"id":"36434cac-012a-4147-a0ca-c8f03c683e2b","name":"seed","numberOfColumns":3,"settings":{},"users":[{"name":"Test1","initials":"T1","color":"red","id":"c76d4908-bd0d-4246-bc2f-e0b7789d8507"},{"name":"Test2","initials":"T2","color":"blue","id":"fdf102b0-74a1-4bcf-bc69-a2043622b975"},{"name":"Test3","initials":"T3","color":"black","id":"79589ee5-2cc7-48c7-9ded-c923e3e66e7b"},{"name":"Test4","initials":"T4","color":"purple","id":"8467ace7-b654-4a6b-a2a0-a87e6877b6fe"}],"archived":[],"browser":"48c962bd-e27c-4690-b39a-0c7a869935e9","columns":["aef7acc5-1297-4ee8-a695-2322c317675e","50695e55-0e7c-4075-a42b-207faaf703f2","b6396b6e-6157-4a2a-8de5-12e59018a641"]}', 1462648485799, 1462811581435, '48c962bd-e27c-4690-b39a-0c7a869935e9', 'CARD_DELETE', '');

-- --------------------------------------------------------

--
-- Table structure for table `kanbanAll`
--

CREATE TABLE `kanbanAll` (
`id` int(11) NOT NULL,
  `json` longtext NOT NULL,
  `timestamp` bigint(20) NOT NULL,
  `servertimestamp` bigint(20) NOT NULL,
  `browser` varchar(256) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `kanbanColumn`
--

CREATE TABLE `kanbanColumn` (
  `id` varchar(256) NOT NULL,
  `name` varchar(256) NOT NULL,
  `cards` longtext NOT NULL,
  `settings` longtext NOT NULL,
  `json` longtext NOT NULL,
  `kanban` varchar(256) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `kanbanColumn`
--

INSERT INTO `kanbanColumn` (`id`, `name`, `cards`, `settings`, `json`, `kanban`) VALUES
('50695e55-0e7c-4075-a42b-207faaf703f2', 'tweede kolom', '[]', '{"color":"#cac2c2"}', '{"id":"50695e55-0e7c-4075-a42b-207faaf703f2","name":"tweede kolom","settings":{"color":"#cac2c2"},"cards":[],"kanbanId":"36434cac-012a-4147-a0ca-c8f03c683e2b","browser":"d435786f-f3c0-4f24-9300-457585ad5c4c"}', '36434cac-012a-4147-a0ca-c8f03c683e2b'),
('aef7acc5-1297-4ee8-a695-2322c317675e', 'eerste kolom', '[]', '{}', '{"id":"aef7acc5-1297-4ee8-a695-2322c317675e","name":"eerste kolom","settings":{},"cards":[],"kanbanId":"36434cac-012a-4147-a0ca-c8f03c683e2b","browser":"48c962bd-e27c-4690-b39a-0c7a869935e9"}', '36434cac-012a-4147-a0ca-c8f03c683e2b'),
('b6396b6e-6157-4a2a-8de5-12e59018a641', 'laatste kolom', '[]', '{}', '{"id":"b6396b6e-6157-4a2a-8de5-12e59018a641","name":"laatste kolom","settings":{},"cards":[],"kanbanId":"36434cac-012a-4147-a0ca-c8f03c683e2b","browser":"48c962bd-e27c-4690-b39a-0c7a869935e9"}', '36434cac-012a-4147-a0ca-c8f03c683e2b');

-- --------------------------------------------------------

--
-- Table structure for table `locking`
--

CREATE TABLE `locking` (
  `kanban` varchar(256) NOT NULL,
  `master` varchar(256) NOT NULL,
  `timestamp` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `card`
--
ALTER TABLE `card`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `id` (`id`), ADD KEY `kanban` (`kanban`);

--
-- Indexes for table `kanban`
--
ALTER TABLE `kanban`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `id_2` (`id`), ADD KEY `id` (`id`), ADD KEY `id_3` (`id`);

--
-- Indexes for table `kanbanAll`
--
ALTER TABLE `kanbanAll`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `kanbanColumn`
--
ALTER TABLE `kanbanColumn`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `id` (`id`), ADD KEY `kanban` (`kanban`);

--
-- Indexes for table `locking`
--
ALTER TABLE `locking`
 ADD UNIQUE KEY `kanban` (`kanban`), ADD KEY `kanban_2` (`kanban`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `kanbanAll`
--
ALTER TABLE `kanbanAll`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;