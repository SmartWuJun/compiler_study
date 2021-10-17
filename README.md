# compiler_study

通过 the-super-tiny-compiler 入门编译原理
编译原理学习

### 编译过程

tokenizer 词法解析 获取 tokens（单词数组）
parser 语法解析 分析 tokens 生成 ast(抽象语法树)
transfer 转换 操作抽象语法树 生成新的 ast
codeGenerator 根据新的 ast 生成 新代码
