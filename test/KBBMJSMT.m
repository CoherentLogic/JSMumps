KBBMJSMT ;CLD/JPW - JSMUMPS TESTS;13 JUL 2017
;;0.01;JSMUMPS;***;13 JUL 2017;Build 1
 QUIT
 ;;
procArguments(FIRST,SECOND,THIRD)
 W FIRST+SECOND+THIRD,!
 QUIT
 ;;
procNoArguments
 W "PROC WITHOUT ARGUMENTS",!
 QUIT
 ;;
funcArguments(FIRST,SECOND,THIRD)
 QUIT FIRST+SECOND+THIRD
 ;;
funcNoArguments()
 QUIT "FUNC WITHOUT ARGUMENTS"
 ;;