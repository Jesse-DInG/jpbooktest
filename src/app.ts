import fetch from 'node-fetch';
import { CronJob } from 'cron';
import { sendEmail } from './mail.js';


const START_DAY = 5;
const END_DAY = 11;
interface IBookInfo {
    label: string;
    date: Date;
    start_at: string;
    end_at: string;
    deposit_accepted: boolean;
}

async function fetchData () {
    const res = await fetch('https://yoyaku.toreta.in/web/v1/web_reservations/2rfrPEEivFVjPFOeR_p1cNRxa2-8TepYXz0k0DHXlv4/days.json?year=2025&month=10&seats=2');
    const json: any = await res.json();

    const list: IBookInfo[] = [];
    json.result.days.forEach((v: any) => {
        if (v && v.length > 0) {
            v.forEach((item: any) => {
                list.push({
                    label: item.label,
                    date: new Date(item.start_at * 1000),
                    start_at: formateDate(item.start_at * 1000),
                    end_at: formateDate(item.end_at * 1000),
                    deposit_accepted: item.deposit_accepted
                })
            });
        }
    })

    return list;
}

function formateDate (ticks: number) {
    const date = new Date(ticks);
    const options = {
        timeZone: 'Asia/Tokyo',
        hour12: false // 使用24小时制
    };

    const formatter = new Intl.DateTimeFormat('ja-JP', options);
    const japanTime = formatter.format(date);
    return japanTime;
}


// 初始化调度器
const scheduler = new CronJob('*/10 * * * * *', async () => {
    const bookList = await fetchData();
    const acceptList = bookList.filter(v => {
        const day = v.date.getDate();
        if (day >= START_DAY && day <= END_DAY) {
            return true;
        }
        return false;
    })

    if (acceptList.length > 0) {
        let titleList:string[] = [];
        let contentList:string[] = [];
        acceptList.forEach(v => {
            titleList.push(`${v.start_at} ${v.label} 可定`);
            contentList.push(`<p>时间: ${v.start_at}:${v.label}, 是否预付订金: ${v.deposit_accepted}</p>`);
        })

        // 发送邮件
        await sendEmail({
            subject: `冰雪之门：${titleList.join(';')}`,
            html: contentList.join('\n')
        });
        console.log(`bookList`, bookList);
    }
},undefined,undefined,undefined,undefined,true);

scheduler.start();