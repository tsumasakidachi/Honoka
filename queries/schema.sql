--
-- Database: `line`
--

-- --------------------------------------------------------

--
-- テーブルの構造 `lines`
--

CREATE TABLE `lines` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime NOT NULL,
  `host_name` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('notice','error','chat','join','leave','wisper') COLLATE utf8mb4_unicode_ci NOT NULL,
  `player` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `text` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `lines`
--
ALTER TABLE `lines`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `lines`
--
ALTER TABLE `lines`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;
