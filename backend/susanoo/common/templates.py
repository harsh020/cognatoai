
_email_otp = """\
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email OTP Template</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            background-color: #ffffff;
            color: #ffffff;
            margin: 0;
            padding: 0;
        }}
        .container {{
            max-width: 600px;
            margin: auto;
            background-color: #000000;
            border-radius: 20px;
            overflow: hidden;
            color: #ffffff;
        }}
        .header {{
            background-color: #000000;
            padding: 10px;
            text-align: center;
            border-bottom: 1px solid #333333;
        }}
        .header img {{
            max-width: 60px;
        }}
        .content {{
            padding: 30px;
            color: #ffffff;
        }}
        .content h1 {{
            font-size: 24px;
            margin-bottom: 20px;
        }}
        .otp {{
            display: block;
            background-color: rgba(51,51,51,0.6);
            border: 1px solid #333333;
            color: #ffffff;
            font-size: 24px;
            padding: 10px 30px;
            text-align: center;
            border-radius: 5px;
            margin: 20px auto;
            width: fit-content;
            letter-spacing: 0.1em;
        }}
        .footer {{
            background-color: #000000;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #999999;
            border-top: 1px solid #333333;
        }}
        .footer a {{
            text-decoration: none;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://cognatoai.blob.core.windows.net/assets/cognatoai-logo.png" alt="Logo">
        </div>
        <div class="content" style="color:white;">
            <p>Hi {user},</p>
            <p>We received your request to verify your account through your email. Your verification code is:</p>
            <div class="otp">{otp}</div>
            <p>If you did not request this code, it is possible that someone else is trying to access the account. <strong>Do not forward or give this code to anyone.</strong></p>
            <p>You are receiving this because your email is associated with Cognato AI Account.</p>
            <p>Sincerely yours,<br>Cognato AI Team</p>
        </div>
        <div class="footer">
            <a src='https://cognatoai.com'>Cognato AI</p>
        </div>
    </div>
</body>
</html>
"""



email_otp = """\
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email OTP Template</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }}
        .container {{
            max-width: 600px;
            margin: auto;
            border-radius: 20px;
            overflow: hidden;
            border: 1px solid #d2d2d2;
        }}
        .header {{
            padding: 10px;
            text-align: center;
            border-bottom: 1px solid #d2d2d2;
        }}
        .header img {{
            max-width: 60px;
            background: transparent;
        }}
        .content {{
            padding: 30px;
        }}
        .content h1 {{
            font-size: 24px;
            margin-bottom: 20px;
        }}
        .otp {{
            display: block;
            background-color: rgba(210,210,210,0.4);
            border: 1px solid #d2d2d2;
            font-size: 24px;
            padding: 10px 30px;
            text-align: center;
            border-radius: 5px;
            margin: 20px auto;
            width: fit-content;
            letter-spacing: 0.1em;
        }}
        .footer {{
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #d2d2d2;
            border-top: 1px solid #d2d2d2;
        }}
        .footer a {{
            text-decoration: none;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://cognatoai.blob.core.windows.net/assets/cognatoai-logo-sm.png" alt="Logo">
        </div>
        <div class="content">
            <p>Hi {user},</p>
            <p>We received your request to verify your account through your email. Your verification code is:</p>
            <div class="otp">{otp}</div>
            <p>If you did not request this code, it is possible that someone else is trying to access the account. <strong>Do not forward or give this code to anyone.</strong></p>
            <p>You are receiving this because your email is associated with Cognato AI Account.</p>
            <p>Sincerely yours,<br>Cognato AI Team</p>
        </div>
        <div class="footer">
            <a src='https://cognatoai.com'>Cognato AI</p>
        </div>
    </div>
</body>
</html>
"""



interview_invite = """\
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interview Invitation</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 20px;
        }}
        .container {{
            max-width: 80vw;
            margin: 0 auto;
            /* background-color: #F7F8FC; */
            padding: 20px;
            border-radius: 10px;
            color: #333333;
            border: 1px solid #dddddd;
        }}
        .header {{
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #dddddd;
        }}
        .header h1 {{
            margin: 0;
            font-size: 24px;
            color: #333333;
        }}
        .content {{
            margin-top: 20px;
        }}
        .content p {{
            line-height: 1.6;
            color: #333333;
        }}
        .footer {{
            text-align: center;
            margin-top: 20px;
            border-top: 1px solid #dddddd;
            padding-top: 20px;
        }}
        .footer img {{
            max-width: 40px;
        }}
        .footer p {{
            color: #999999;
            font-size: 12px;
        }}
        .button {{
            display: inline-block;
            padding: 10px 20px;
            color: #ffffff;
            background-color: #007bff;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Interview Invitation</h1>
        </div>
        <div class="content">
            <div>
              <div>Dear {candidate},</div><br>
              <div>We are pleased to invite you for an interview for the position of {role}. We would like to learn more about your qualifications and experience.</div>
            </div>

            <br>

            <div>
              <div><b>Interview Details:</b></div>
              <div>
                <ul>
                  <b>Expires:</b> Within <b>2 hours</b><br>
                  <b>Location:</b> <a href="{link}" target="_blank">Meeting Link</a>
                </ul>
              </div>
            </div>


            <div>
              <div><b>Interview Guidelines:</b></div>
              <div>
                <ul>
                    <li>Ensure you have a good internet connection.</li>
                    <li>Before joining the interview make sure to grant permissions for camera and microphone.</li>
                    <li>For the beta you can switch off the camera, but do not switch off the mic.</li>
                    <li>For the beta the meeting is not being recorded but please be respectful.</li>
                    <li>For beta the live transcriptions are turned off. So, please use the Start/Stop button to speak and stop.</li>
                    <li>Once in meeting, do not refresh the page or leave the interview.</li>
                    <li>If something goes wrong please leave the interview and contact Cognato AI Team.</li>
                </ul>
              </div>
            </div>

            <br>

            <div>
              <div>If you have any questions or need to reschedule, feel free to contact us.</div><br>
              <div>We look forward to meeting you and discussing how you can contribute to our team.</div>
            </div>

            <br>

            <div>
              <div>Best regards,</div>
              <div>{interviewer}</div>
            <div>

            <br><br>
            <div>
              <b style="font-size: 14px;">**Please note that this interview is being conducted by Cognato AI and is not a hiring interview for Cognato AI.</b>
            </div>
        </div>
        <div class="footer">
            <img src="https://cognatoai.blob.core.windows.net/assets/cognatoai-logo-sm.png" alt="Logo">
            <p>&copy; 2024 Cognato AI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""


_platform_invite = """\
Hi {user},

We hope you’re doing well!

Thank you for your patience since joining our waitlist. We're excited to announce that we're launching our first restricted beta, and we'd love for you to try it out.

Here are a few things to note:
- Manual Approval: Due to limited resources, interview requests will be manually approved. This might take some time, especially with different time zones, so we appreciate your patience.
- Testing First: We recommend testing the product yourself before using it for real hiring purposes. Once you’ve tried a few interviews and are satisfied with the results, feel free to use it as needed.
- Real-Time Transcripts: Please note that we currently have limited resources for real-time transcription features.
- Free Trial: Our early beta includes a free trial period, so you can test the product without any cost.

We value your feedback immensely. If you have any suggestions or issues, please reply to this email or contact us at support@cognatoai.com.\
Remember, we're in the early stages, and your feedback is crucial to our improvement.

Join now: https://cognatoai.com

Best regards,
Cognato AI Team
"""

platform_invite = """\
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interview Invitation</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            background-color: #ffffff;
            margin: 0;
            padding: 20px;
        }}
        .container {{
            max-width: 80vw;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 10px;
            border: 1px solid #dddddd;
            color: #333333;
        }}
        .header {{
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #dddddd;
        }}
        .header h1 {{
            margin: 0;
            font-size: 24px;
            color: #333333;
        }}
        .content {{
            margin-top: 20px;
        }}
        .content p {{
            line-height: 1.6;
            color: #333333;
        }}
        .footer {{
            text-align: center;
            margin-top: 20px;
            border-top: 1px solid #dddddd;
            padding-top: 20px;
        }}
        .footer img {{
            max-width: 40px;
        }}
        .footer p {{
            color: #999999;
            font-size: 12px;
        }}
        .button {{
            display: inline-block;
            padding: 10px 20px;
            color: #ffffff;
            background-color: #007bff;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Beta Launch</h1>
        </div>
        <div class="content">
            <div>
              <div>Hi {user},</div><br>
              <div>We hope you’re doing well!</div><br>
              <div>Thank you for your patience since joining our waitlist. We're excited to announce that we're launching our first restricted beta, and we'd love for you to try it out.</div>
            </div>

            <br>

            <div>
              <div>Here are a few things to note:</div>
              <div>
                <ul>
                  <li><b>Manual Approval:</b> Due to limited resources, interview requests will be manually approved. This might take some time, especially with different time zones, so we appreciate your patience.</li>
                  <li><b>Testing First:</b> We recommend testing the product yourself before using it for real hiring purposes. Once you’ve tried a few interviews and are satisfied with the results, feel free to use it as needed.</li>
                  <li><b>Real-Time Transcripts:</b> Please note that we currently have limited resources for real-time transcription features.</li>
                  <li><b>Free Trial:</b> Our early beta includes a free trial period, so you can test the product without any cost.</li>
                  <li><b>Desktop Website:</b> Currently, our website is only supported on desktops and laptops. Please be patient while we work on our mobile sites.</li>
                </ul>
              </div>
            </div>


            <br>

            <div>
              <div>
                We value your feedback immensely. If you have any suggestions or issues, please reply to this email or contact us at support@cognatoai.com. Remember, we're in the early stages, and your feedback is crucial to our improvement.
              </div>
            </div>

            <br>

            <div>
                <b><div>Join now: <a href='https://cognatoai.com'>https://cognatoai.com</a></div></b>
            </div>

            <br>

            <div>
              <div>Best regards,</div>
              <div>Cognato AI Team</div>
            <div>
        </div>
        <div class="footer">
            <img src="https://cognatoai.blob.core.windows.net/assets/cognatoai-logo-sm.png" alt="Logo">
            <p>&copy; 2024 Cognato AI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""

free_resume_review_promotion = """\
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Free Resume Review</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 20px;
        }}
        .container {{
            max-width: 80vw;
            margin: 0 auto;
            /* background-color: #F7F8FC; */
            padding: 20px;
            border-radius: 10px;
            color: #333333;
            border: 1px solid #dddddd;
        }}
        .header {{
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #dddddd;
        }}
        .header h1 {{
            margin: 0;
            font-size: 24px;
            color: #333333;
        }}
        .content {{
            margin-top: 20px;
        }}
        .content p {{
            line-height: 1.6;
            color: #333333;
        }}
        .footer {{
            text-align: center;
            margin-top: 20px;
            border-top: 1px solid #dddddd;
            padding-top: 20px;
        }}
        .footer img {{
            max-width: 40px;
        }}
        .footer p {{
            color: #999999;
            font-size: 12px;
        }}
        .button {{
            display: inline-block;
            padding: 10px 20px;
            color: #ffffff;
            background-color: #007bff;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Free Resume Review</h1>
        </div>
        <div class="content">
            <div>
              <div>Hi there,</div><br>
              <div>Our team at Cognato AI is doing free resume reviews. It is an amazing offer where you need not pay a penny!</div>
            </div>

            <br>

            <div>
              <div><b>How to avail:</b></div>
              <div>
                <ul>
                  <li>Go to https://cognatoai.com</li>
                  <li>Sign Up/Login and schedule an interview (don't worry it is in trial, so free)</li>
                  <li>Schedule and give an interview (please note, there will be DSA questions, so, you need to have DSA skills)</li>
                  <li>Give honest feedback.</li>
                  <li>Keep an eye on your inbox for a resume review.</li>
                </ul>
              </div>
            </div>


            <div>
              <div><b>Extra Offer:</b></div>
              <div>
                <ul>
                  <li>Get on a call with us to explain more about your interview experience.</li>
                  <li>We give you more detailed feedback on your resume, with some tips and resources (if applicable).</li>
                </ul>
              </div>
            </div>

            <br>

            <div>
              <div>If you have any questions, feel free to contact us.</div><br>
              <div>We look forward to meeting you and discussing how we can impove your experience.</div>
            </div>

            <br>

            <div>
              <div>Best regards,</div>
              <div>Cognato AI Team</div>
            <div>
            
            <br><br>
            <div>
              <b style="font-size: 14px;">**Please note that this is a limited time offer and is subjected to availability.</b>
            </div>
        </div>
        <div class="footer">
            <img src="https://cognatoai.blob.core.windows.net/assets/cognatoai-logo-sm.png" alt="Logo">
            <p>&copy; 2024 Cognato AI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""