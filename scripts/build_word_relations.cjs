if (process.argv.slice(2).length === 0) {
  process.argv.push('all')
}

require('./build_n5_word_relations.cjs')
