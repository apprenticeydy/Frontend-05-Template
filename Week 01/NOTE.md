学习笔记

1.TicTacToe    
    1 array(二维)
    2 array(一维)

2.Async
    callback
    Promise
    async/await



3. 五子棋
    AI思路 bestChoice

    验证赢棋算法

    虚拟每步价值
    我方赢棋(或可能赢棋) 1
    阻止对方赢棋 1

    下一回合(t)):
    我方赢棋 1 - (t*.1)
    阻止对方赢棋 1 - (t*.1)

    d = 深度搜索1 ~ 5格, 分别观察

    迭代规则:
    取我方所有落子周围半径d 的合集.
    使用异步同时推演
    取得价值最高的那一步棋

    代码复杂度:

    


    