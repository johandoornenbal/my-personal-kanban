-- phpMyAdmin SQL Dump
-- version 4.2.10
-- http://www.phpmyadmin.net
--
-- Host: localhost:8889
-- Generation Time: Apr 25, 2016 at 07:07 AM
-- Server version: 5.5.38
-- PHP Version: 5.6.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `kanban`
--

-- --------------------------------------------------------

--
-- Table structure for table `kanban`
--

CREATE TABLE `kanban` (
  `id` varchar(256) NOT NULL DEFAULT '0',
  `json` longtext NOT NULL,
  `timestamp` bigint(20) NOT NULL,
  `servertimestamp` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `kanban`
--

INSERT INTO `kanban` (`id`, `json`, `timestamp`, `servertimestamp`) VALUES
('36434cac-012a-4147-a0ca-c8f03c683e2b', '{"singlekanban":{"id":"36434cac-012a-4147-a0ca-c8f03c683e2b","name":"seed","numberOfColumns":2,"columns":[{"name":"Kolom 1","cards":[]},{"name":"Kolom 2","cards":[]}],"archived":[],"users":[],"settings":{}}}', 1461509302068, 1461509302100);

-- --------------------------------------------------------

--
-- Table structure for table `kanbanAll`
--

CREATE TABLE `kanbanAll` (
`id` int(11) NOT NULL,
  `json` longtext NOT NULL,
  `timestamp` bigint(20) NOT NULL,
  `servertimestamp` bigint(20) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `kanbanAll`
--

INSERT INTO `kanbanAll` (`id`, `json`, `timestamp`, `servertimestamp`) VALUES
(1, '{"kanbans":{},"timestamp":1461509302068}', 1461509302068, 1461509302100);

--
-- Indexes for dumped tables
--

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
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `kanbanAll`
--
ALTER TABLE `kanbanAll`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;