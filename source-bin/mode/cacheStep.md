# Prune file from unmanaged cache


Cache is the old and unused file will get removed periodically.

While some cache is managed, meaning really old cache file will be removed automatically,
  other cache like `npm` or `babel-loader` is append-only and never auto reduce.

The good thing about cache is the file's often not tight related,
  so deleting random part of cache files should not produce a wrong result,
  just slower build.

To add auto prune to those un-managed cache, we need a way to identify the old files.
The common way is by checking times in file systems:
  if the file is newly created, keep;
  if the file is changed, keep;
  if the file is read, keep;
So that's often called `birthtime`, `mtime`, `atime` of an [inode stat](https://man7.org/linux/man-pages/man7/inode.7.html),
  and should be relatively well supported cross-platform.
Now we just need a time to compare with, whether it's before the recent build,
 or 8 days ago, just compare the time and drop the files,
 job done.

To repeat, the auto cache prune need 2 steps:
- mark: mark the max acceptable stale time
- prune: check cache file stat time and prune the old ones

The nuisance is often in the details:
  `atime` update can be turned off to gain performance boost,
  or the stat update is slightly delayed to batch the write to disk,
  and also platform difference.

So in a CI environment, and to counter the unstable stat time, we need 3 steps:
- setup: before the CI load the cache, which is likely a `tar` unpack command, record the `setup-time`
- mark: after the CI load the cache, but before the install & build process that will use the cache, mark the max acceptable stale time, or `mark-time`
- prune: after the cache use, but before the cache save back, check cache file stat time and prune the old ones

In the GitHub Action environment, strange things happen:
  there're files have `mtime` between `setup-time` and `mark-time`,
  which is weird, for the untouched cache file should have `mtime` from previous build, ie older than `setup-time`,
  and updated file should have `mtime` newer than `mark-time`
To address this, there's a `bugList` prepared for those files in `source/node/cache/staleCheck.js`
