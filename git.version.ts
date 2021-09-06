const fs = require('fs');
import { Observable } from 'rxjs';
import { combineLatest } from 'rxjs';

let exec = require('child_process').exec;

let gitCmdList = {
  'commitId': 'git rev-parse HEAD',
  'commitIdAbbrev': 'git rev-parse --short HEAD',
  'branch': 'git rev-parse --abbrev-ref HEAD',
  'userName': 'git config user.name',
  'userEmail': 'git config user.email',
  'lastCommitUserName': 'git log -1 --pretty=format:\"%an\"',
  'lastCommitUserEmail': 'git log -1 --pretty=format:\"%ae\"',
  'lastCommitDate': 'git log -1 --pretty=format:\"%ai\"',
  'lastCommitMessage': 'git log -1 --pretty=format:\"%s\"',
}

const baseFunction = function (error: Error, stdout: Buffer | string, stderr: Buffer, s: any) {
  // console.warn(`baseFunction`)
  if (error !== null) {
    console.log('git error: ' + error + stderr);
  }
  s.next(stdout.toString().trim());
  s.complete();
}


const commitId = new Observable<string>(s => {
  exec(gitCmdList.commitId,
    function (error: Error, stdout: Buffer, stderr: Buffer) {
      baseFunction(error, stdout, stderr, s)
    })
});

const commitIdAbbrev = new Observable<string>(s => {
  exec(gitCmdList.commitIdAbbrev,
    function (error: Error, stdout: Buffer, stderr: Buffer) {
      baseFunction(error, stdout, stderr, s)
    })
});

const branch = new Observable<string>(s => {
  exec(gitCmdList.branch,
    function (error: Error, stdout: Buffer, stderr: Buffer) {
      baseFunction(error, stdout, stderr, s)
    });
});

const userEmail = new Observable<string>(s => {
  exec(gitCmdList.userEmail,
    function (error: Error, stdout: Buffer, stderr: Buffer) {
      baseFunction(error, stdout, stderr, s)
    })
})

const userName = new Observable<string>(s => {
  exec(gitCmdList.userName,
    function (error: Error, stdout: Buffer, stderr: Buffer) {
      baseFunction(error, stdout, stderr, s)
    })
})


const lastCommitUserName = new Observable<string>(s => {
  exec(gitCmdList.lastCommitUserName,
    function (error: Error, stdout: Buffer, stderr: Buffer) {
      baseFunction(error, stdout, stderr, s)
    })
})

const lastCommitUserEmail = new Observable<string>(s => {
  exec(gitCmdList.lastCommitUserEmail,
    function (error: Error, stdout: Buffer, stderr: Buffer) {
      baseFunction(error, stdout, stderr, s)
      // console.warn(`lastCommitUserEmail s:`, s)
    })
})

const lastCommitDate = new Observable<string>(s => {
  exec(gitCmdList.lastCommitDate,
    function (error: Error, stdout: Buffer, stderr: Buffer) {

      // console.warn(`type s:`, stdout)
      let stdoutFormat = stdout.toString().replace(/-|:| |\+0800/g, '');
      // console.log(`stdoutFormat:`, stdoutFormat)
      baseFunction(error, stdoutFormat, stderr, s)
    })
})

const lastCommitMessage = new Observable<string>(s => {
  exec(gitCmdList.lastCommitMessage,
    function (error: Error, stdout: Buffer, stderr: Buffer) {
      baseFunction(error, stdout, stderr, s)
    })
})

const formatDate = (now = new Date()) => {
  let dateStr = '',
    year = '' + now.getFullYear(),
    month = '' + (now.getMonth() + 1),
    date = '' + now.getDate(),
    hours = '' + now.getHours(),
    minutes = '' + now.getMinutes(),
    seconds = '' + now.getSeconds();

  if (month.length < 2) month = '0' + month;
  if (date.length < 2) date = '0' + date;
  if (hours.length < 2) hours = '0' + hours;
  if (minutes.length < 2) minutes = '0' + minutes;
  if (seconds.length < 2) seconds = '0' + seconds;

  dateStr = year + month + date + hours + minutes + seconds;
  // console.log(dateStr);
  return dateStr;
}

  combineLatest(commitId, commitIdAbbrev, branch, userEmail, userName, lastCommitUserName, lastCommitUserEmail, lastCommitDate, lastCommitMessage)
  .subscribe(([commitId, commitIdAbbrev, branch, userEmail, userName, lastCommitUserName, lastCommitUserEmail, lastCommitDate, lastCommitMessage]) => {
    // console.log(`version: '${process.env.npm_package_version}', commitId: '${commitId}', branch: '${branch}'`);
    // console.log(`lastCommitUserName:`, lastCommitUserName);

    const content = `
    {
      "git.branch": "${branch}", 
      "git.build.time": "${formatDate()}",
      "git.build.user.name": "${userName}",
      "git.closest.tag.name" : "${branch}",
      "git.commit.id" : "${commitId}",
      "git.commit.id.abbrev" : "${commitIdAbbrev}",
      "git.commit.time" : "${lastCommitDate}",
      "git.commit.user.name" : "${lastCommitUserName}"
    }`;

    fs.writeFileSync(
      'git.properties.json',
      content,
      {encoding: 'utf8'}
    );

  });
